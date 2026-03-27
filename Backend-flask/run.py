import os
from app import create_app
    
app = create_app()

@app.route('/health')
def health():
    return "OK"

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=PORT)