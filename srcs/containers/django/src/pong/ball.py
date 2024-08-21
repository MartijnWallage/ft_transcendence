import random

class Ball:
    def __init__(self):
        self.radius = 0.3
        self.position = {'x': 0, 'z': 0}
        self.initial_speed = 0.2
        self.angle_multiplier = 0.2
        self.dx = 0
        self.dz = 0
        self.serve = 1

    def resetBall(self):
        self.position['x'] = 0
        self.position['z'] = 0
        self.dx = 0
        self.dz = 0

    def serveBall(self):
        self.position['x'] = 0
        self.position['z'] = 0
        self.serve *= -1
        self.dx = self.initial_speed * self.serve / 2
        self.dz = random.uniform(-0.075, 0.075)  # Random Z direction

    def checkPaddleCollision(self, paddle):
        top_paddle = paddle.position['z'] - paddle.depth / 2
        bottom_paddle = paddle.position['z'] + paddle.depth / 2
        left_paddle = paddle.position['x'] - paddle.width / 2
        right_paddle = paddle.position['x'] + paddle.width / 2

        top_ball = self.position['z'] - self.radius
        bottom_ball = self.position['z'] + self.radius
        left_ball = self.position['x'] - self.radius
        right_ball = self.position['x'] + self.radius

        return (bottom_ball >= top_paddle and top_ball <= bottom_paddle) and \
               ((self.dx < 0 and left_ball <= right_paddle and right_ball >= left_paddle) or \
                (self.dx > 0 and right_ball >= left_paddle and left_ball <= right_paddle))

    def tryPaddleCollision(self, paddle_p1, paddle_p2):
        paddle = paddle_p2 if self.dx > 0 else paddle_p1

        if self.checkPaddleCollision(paddle):
            self.dz = (self.position['z'] - paddle.position['z']) * self.angle_multiplier
            self.dx *= -2 if abs(self.dx) < self.initial_speed / 1.5 else -1.01

    def checkCourtCollision(self, court_depth):
        top_ball = self.position['z'] - self.radius
        bottom_ball = self.position['z'] + self.radius
        half_court = court_depth / 2
        top_court = -half_court
        bottom_court = half_court
        
        return (self.dz > 0 and bottom_ball > bottom_court) or \
               (self.dz < 0 and top_ball < top_court)

    def tryCourtCollision(self, court_depth):
        if self.checkCourtCollision(court_depth):
            self.dz *= -1

    def animateBall(self):
        self.position['x'] += self.dx
        self.position['z'] += self.dz

    @property
    def x(self):
        return self.position['x']

    @property
    def z(self):
        return self.position['z']
