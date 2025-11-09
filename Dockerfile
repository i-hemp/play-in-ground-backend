FROM python:3.11-slim

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy dependencies file and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 4: Copy everything
COPY . .

# Step 5: Expose FastAPI port
EXPOSE 8000

# Step 6: Start FastAPI server when container runs
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
