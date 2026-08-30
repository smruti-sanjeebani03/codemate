package com.codemate.entity;

/**
 * Authentication Provider enumeration for CodeMate users.
 * Supports standard local Email+Password, verified Google OAuth, and verified GitHub OAuth.
 */
public enum AuthProvider {
    LOCAL,
    GOOGLE,
    GITHUB
}
