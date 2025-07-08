from . import database as db

async def log_gm_action(admin_user: str, target_user: str, action: str, details: str) -> None:
    """Record an administrative action to the gm_audit_log table."""
    print(f"[GM] {admin_user} -> {target_user}: {action} {details}")
    await db.query(
        'INSERT INTO gm_audit_log (admin_user, target_user, action, details) VALUES (%s, %s, %s, %s)',
        [admin_user, target_user, action, details]
    )

async def log_auth_fail(user, command: str) -> None:
    """Log a failed authorization attempt."""
    user_str = f"{user.name} ({user.id})"
    print(f"[AUTH_FAIL] {user_str} - {command}")
    await db.query(
        'INSERT INTO gm_audit_log (admin_user, target_user, action, details) VALUES (%s, %s, %s, %s)',
        [user_str, 'N/A', 'AUTH_FAIL', command]
    )
