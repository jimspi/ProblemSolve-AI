// Supabase client initialization
const { createClient } = supabase;
const _supabase = createClient(
    'https://wdrfkbiyjkquygchhmft.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcmZrYml5amtxdXlnY2hobWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTI4NDQsImV4cCI6MjA2NzA4ODg0NH0.NCJ_m0zIJ4C3xP5NBO0QbxdaoBHBvipg2-WnuRtGmnQ' // Replace with your actual anon key
);

// Global auth functions
window.supabaseAuth = {
    // Sign up new user
    signUp: async (email, password, userData = {}) => {
        try {
            const { data, error } = await _supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: userData.firstName + ' ' + userData.lastName,
                        company: userData.company,
                        team_size: userData.teamSize,
                        role: userData.role,
                        ...userData
                    },
                    emailRedirectTo: `${window.location.origin}/dashboard.html`
                }
            });
            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    // Sign in existing user
    signIn: async (email, password) => {
        try {
            const { data, error } = await _supabase.auth.signInWithPassword({ 
                email, 
                password 
            });
            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    // Sign out user
    signOut: async () => {
        try {
            const { error } = await _supabase.auth.signOut();
            localStorage.clear(); // Clear any app data
            sessionStorage.clear();
            return { error };
        } catch (error) {
            return { error };
        }
    },
    
    // Get current user
    getUser: async () => {
        try {
            const { data, error } = await _supabase.auth.getUser();
            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    // Get current session
    getSession: async () => {
        try {
            const { data, error } = await _supabase.auth.getSession();
            return { data, error };
        } catch (error) {
            return { data: null, error };
        }
    },
    
    // Listen to auth state changes
    onAuthStateChange: (callback) => {
        return _supabase.auth.onAuthStateChange(callback);
    },
    
    // Check if user is authenticated
    isAuthenticated: async () => {
        const { data } = await _supabase.auth.getSession();
        return !!data.session;
    },
    
    // Protect page function
    protectPage: async () => {
        const { data } = await _supabase.auth.getSession();
        if (!data.session) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },
    
    // Redirect if already authenticated
    redirectIfAuthenticated: async () => {
        const { data } = await _supabase.auth.getSession();
        if (data.session) {
            window.location.href = '/dashboard.html';
            return true;
        }
        return false;
    }
};

// Auto-initialize auth state tracking
document.addEventListener('DOMContentLoaded', () => {
    window.supabaseAuth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        // Update UI based on auth state
        if (event === 'SIGNED_IN' && session) {
            console.log('User signed in:', session.user.email);
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
        }
    });
});

// Utility functions for UI feedback
window.authUtils = {
    showMessage: (message, type = 'info') => {
        // Remove existing messages
        const existingMsg = document.querySelector('.auth-message');
        if (existingMsg) existingMsg.remove();
        
        // Create new message
        const msgEl = document.createElement('div');
        msgEl.className = `auth-message auth-message-${type}`;
        msgEl.style.cssText = `
            padding: 12px 16px;
            margin: 16px 0;
            border-radius: 8px;
            font-weight: 500;
            ${type === 'error' ? 'background: #fee; color: #c53030; border: 1px solid #fed7d7;' : ''}
            ${type === 'success' ? 'background: #f0fff4; color: #2f855a; border: 1px solid #c6f6d5;' : ''}
            ${type === 'info' ? 'background: #ebf8ff; color: #2c5282; border: 1px solid #bee3f8;' : ''}
        `;
        msgEl.textContent = message;
        
        // Insert message at the top of the form
        const form = document.querySelector('form') || document.body;
        form.insertBefore(msgEl, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (msgEl.parentNode) msgEl.remove();
        }, 5000);
    },
    
    setButtonLoading: (buttonId, loading, originalText = 'Submit') => {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.textContent = 'Loading...';
            button.style.opacity = '0.7';
        } else {
            button.disabled = false;
            button.textContent = originalText;
            button.style.opacity = '1';
        }
    }
};
