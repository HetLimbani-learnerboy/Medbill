from flask import Flask, send_from_directory
import os
from app import create_app
    
app = create_app()

@app.route('/health')
def health():
    return "OK"

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    static_folder = os.path.join(os.getcwd(), 'dist')

    if path != "" and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)

    return send_from_directory(static_folder, 'index.html')

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=PORT)