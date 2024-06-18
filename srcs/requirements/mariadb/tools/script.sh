service mariadb start

echo "-1 check if databse exist"
mysql -uroot -p$SQL_ROOT_PASSWORD -e "use \`${SQL_DATABASE}\`;"
result=$?
if [[ $result -eq 0 ]]

then
	echo "-2 databse exist already"
	echo "-3 shut down"
	mysqladmin -uroot -p$SQL_ROOT_PASSWORD shutdown
	echo "-4 exit bash and start mysql in safe mode with PID 1"
	exec mysqld_safe
else
	echo "-2 create new database"
	sleep 2
	mysql -e "CREATE DATABASE IF NOT EXISTS \`${SQL_DATABASE}\`;"
	sleep 1
	echo "-3 set root password"
	mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${SQL_ROOT_PASSWORD}';"
	sleep 1
	echo "-4 new local user "
	mysql -uroot -p$SQL_ROOT_PASSWORD -e "GRANT ALL PRIVILEGES ON \`${SQL_DATABASE}\`.* TO \`${SQL_USER}\`@'localhost' IDENTIFIED BY '${SQL_PASSWORD}';"
	sleep 1
	echo "-5 new remote user"
	mysql -uroot -p$SQL_ROOT_PASSWORD -e "GRANT ALL PRIVILEGES ON \`${SQL_DATABASE}\`.* TO \`${SQL_USER}\`@'%' IDENTIFIED BY '${SQL_PASSWORD}';"
	sleep 1
	echo "-6 refresh grant table"
	mysql -uroot -p$SQL_ROOT_PASSWORD -e "FLUSH PRIVILEGES;"
	sleep 1
	echo "-7 shut down"
	mysqladmin -uroot -p$SQL_ROOT_PASSWORD shutdown
	sleep 1
	echo "-8 exit bash and start mysql in safe mode with PID 1"
	exec mariadbd-safe
fi
