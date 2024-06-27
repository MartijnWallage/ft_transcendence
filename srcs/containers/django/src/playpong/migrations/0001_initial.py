from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1_position', models.IntegerField(default=0)),
                ('player2_position', models.IntegerField(default=0)),
                ('ball_position_x', models.IntegerField(default=0)),
                ('ball_position_y', models.IntegerField(default=0)),
                ('player1_score', models.IntegerField(default=0)),
                ('player2_score', models.IntegerField(default=0)),
            ],
        ),
    ]
