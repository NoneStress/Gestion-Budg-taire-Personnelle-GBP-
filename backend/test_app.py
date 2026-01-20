#!/usr/bin/env python3
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    print('✅ App loaded successfully')

    # Test routes
    routes = []
    for route in app.routes:
        if hasattr(route, 'path'):
            routes.append(route.path)
    print(f'📋 Routes found: {len(routes)}')
    print(f'🔗 First 5 routes: {routes[:5]}')

    # Test database
    from app.db.session import engine
    from app.db.base import Base
    Base.metadata.create_all(bind=engine)
    print('🗄️  Database tables created successfully')

    print('🚀 All tests passed!')

except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()