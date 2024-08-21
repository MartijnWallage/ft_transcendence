class Paddle:
    def __init__(self, court_width, left=True, width=2):
        self.width = width
        self.depth = 0.8  # Depth of the paddle (along the z-axis)
        self.position = {'x': 0, 'z': 0}
        self.speed = 0.2

        offset = court_width / 15
        distance_from_center = (court_width / 2) - offset
        if left:
            distance_from_center *= -1
        self.position['x'] = distance_from_center

    def movePaddle(self, direction, court_depth):
        self.position['z'] += direction * self.speed

        half_paddle = self.depth / 2
        half_court = court_depth / 2
        top_paddle = self.position['z'] + half_paddle
        bottom_paddle = self.position['z'] - half_paddle

        if bottom_paddle < -half_court:
            self.position['z'] = half_paddle - half_court
        elif top_paddle > half_court:
            self.position['z'] = half_court - half_paddle

    @property
    def x(self):
        return self.position['x']

    @property
    def z(self):
        return self.position['z']
