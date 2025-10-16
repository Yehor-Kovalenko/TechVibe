#backend
FROM mcr.microsoft.com/azure-functions/python:4-python3.10

WORKDIR /home/site/wwwroot

# dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

CMD ["func", "host", "start", "--verbose", "--cors", "*", "--port", "7071"]
