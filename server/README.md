# SharprAI Server Code

## Purpose:
Welcome to this directory! This code is focused on providing a serverside backend that must be run on a machine with an nvidia gpu and, when running, will upscale any mp4 or mkv placed into an input directory in src/ai in real time and place the output into an output directory in src/ai. 

## Notes:
  - Further refactoring changes are coming and this is still somewhat disorganized/janky. 
  - The opensource code used in src/ai is very complicated and will be treated as black box to some extent for simplicity. 

## Setup Instructions:

1. Navigate to server directory:

   ```bash
   cd SAT-4_Image_Classification_ML
   ```

2. Create a virtual environment:

    ```bash
    python -m venv venv
    ```

3. Activate the virtual environment:

   - On Windows:

     ```bash
     .\venv\Scripts\activate
     ```

   - On Linux (cannot use macOS as you need an nvidia gpu):

     ```bash
     source venv/bin/activate
     ```

4. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```



