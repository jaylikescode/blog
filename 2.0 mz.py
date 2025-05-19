import random

# Function to generate and display a maze when the button is pressed
def on_button_press():
    # Initialize pygame
    pygame.init()

    # Set the dimensions of the window
    width, height = 600, 600
    screen = pygame.display.set_mode((width, height))
    pygame.display.set_caption("Maze Game")

    # Define colors
    black = (0, 0, 0)  # Color for walls
    white = (255, 255, 255)  # Color for paths
    blue = (0, 0, 255)  # Sonic's color
    green = (0, 255, 0)  # Color for the goal (end)

    # Define the size of the grid
    grid_size = 30  # Increased path size
    character_size = 20  # Smaller character size
    rows, cols = height // grid_size, width // grid_size

    # Create a grid with walls
    grid = [[1 for _ in range(cols)] for _ in range(rows)]

    # Function to carve out a maze using recursive backtracking
    def carve_maze(x, y):
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        random.shuffle(directions)
        for dx, dy in directions:
            nx, ny = x + dx * 2, y + dy * 2
            if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == 1:
                grid[nx - dx][ny - dy] = 0
                grid[nx][ny] = 0
                carve_maze(nx, ny)

    # Start carving the maze from the top-left corner
    carve_maze(0, 0)

    # Initial position of the character
    player_x, player_y = 0, 0

    # Define the goal position (bottom-right corner)
    goal_x, goal_y = cols - 1, rows - 1
    grid[goal_y][goal_x] = 0  # Ensure the goal is on a path

    # Variables to track key presses for continuous movement
    move_left = move_right = move_up = move_down = False

    # Game loop
    running = True
    clock = pygame.time.Clock()  # To control the frame rate
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            # Handle key press events
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    move_left = True
                elif event.key == pygame.K_RIGHT:
                    move_right = True
                elif event.key == pygame.K_UP:
                    move_up = True
                elif event.key == pygame.K_DOWN:
                    move_down = True

            # Handle key release events
            elif event.type == pygame.KEYUP:
                if event.key == pygame.K_LEFT:
                    move_left = False
                elif event.key == pygame.K_RIGHT:
                    move_right = False
                elif event.key == pygame.K_UP:
                    move_up = False
                elif event.key == pygame.K_DOWN:
                    move_down = False

        # Continuous movement based on key presses
        if move_left and player_x > 0 and grid[player_y][player_x - 1] == 0:
            player_x -= 1
        if move_right and player_x < cols - 1 and grid[player_y][player_x + 1] == 0:
            player_x += 1
        if move_up and player_y > 0 and grid[player_y - 1][player_x] == 0:
            player_y -= 1
        if move_down and player_y < rows - 1 and grid[player_y + 1][player_x] == 0:
            player_y += 1

        # Check if the player has reached the goal
        if player_x == goal_x and player_y == goal_y:
            print("Congratulations! You've reached the goal!")
            running = False  # Exit the game loop when goal is reached

        # Draw the maze with white paths and black walls
        screen.fill(white)  # Fill the screen with white for the paths
        for i in range(rows):
            for j in range(cols):
                if grid[i][j] == 1:
                    pygame.draw.rect(screen, black, (j * grid_size, i * grid_size, grid_size, grid_size))

        # Draw the goal as a green rectangle
        pygame.draw.rect(screen, green, (goal_x * grid_size, goal_y * grid_size, grid_size, grid_size))

        # Draw the player as a small blue circle (representing Sonic)
        pygame.draw.circle(screen, blue, 
                           (player_x * grid_size + grid_size // 2, player_y * grid_size + grid_size // 2), 
                           character_size // 2) 
 