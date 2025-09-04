/**
 * Tests pour le composant AuthForm
 * Composant critique du système d'authentification
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithProviders, mockUser } from '../utils/testHelpers';
import { AuthForm } from './AuthForm';

describe('AuthForm Component', () => {
  const mockOnLogin = vi.fn();
  const mockOnRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock API responses
    global.fetch = vi.fn();
  });

  describe('Login Mode', () => {
    it('should render login form by default', () => {
      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      expect(screen.getByText('Bienvenue sur Exersio')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('should handle login form submission', async () => {
      mockOnLogin.mockResolvedValue(undefined);

      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      const user = userEvent.setup();
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should display loading state during login', async () => {
      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} isLoading={true} />
      );

      const submitButton = screen.getByRole('button', { name: /connexion\.\.\./i });
      expect(submitButton).toBeDisabled();
    });

    it('should display login error', () => {
      const errorMessage = 'Invalid credentials';
      
      renderWithProviders(
        <AuthForm 
          onLogin={mockOnLogin} 
          onRegister={mockOnRegister} 
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should switch to registration mode', async () => {
      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      const user = userEvent.setup();
      await user.click(screen.getByText(/créer un compte/i));

      expect(screen.getByText('Inscription')).toBeInTheDocument();
      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    });
  });

  describe('Registration Mode', () => {
    it('should handle registration form submission', async () => {
      mockOnRegister.mockResolvedValue(undefined);

      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      const user = userEvent.setup();
      
      // Switch to registration
      await user.click(screen.getByText(/créer un compte/i));

      // Fill form
      await user.type(screen.getByLabelText(/nom/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /s'inscrire/i }));

      await waitFor(() => {
        expect(mockOnRegister).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should validate required fields', async () => {
      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      const user = userEvent.setup();
      
      // Switch to registration
      await user.click(screen.getByText(/créer un compte/i));

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /s'inscrire/i }));

      // Should not call onRegister with empty fields
      expect(mockOnRegister).not.toHaveBeenCalled();
    });
  });

  describe('Forgot Password Mode', () => {
    it('should handle forgot password flow', async () => {
      // Mock API call
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email sent' })
      });

      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      const user = userEvent.setup();
      
      // Click forgot password link
      await user.click(screen.getByText(/mot de passe oublié/i));

      expect(screen.getByText('Mot de passe oublié')).toBeInTheDocument();

      // Enter email and submit
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/forgot-password'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com' })
          })
        );
      });
    });
  });

  describe('Email Confirmation Mode', () => {
    it('should handle email confirmation with token', async () => {
      // Mock URL with token
      const mockLocation = {
        search: '?token=abc123&action=confirm-email'
      };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        configurable: true
      });

      // Mock API call
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email confirmed' })
      });

      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      // Should automatically switch to confirm mode and process token
      await waitFor(() => {
        expect(screen.getByText('Confirmation email')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/confirm-email?token=abc123'),
          expect.objectContaining({ method: 'GET' })
        );
      });
    });
  });

  describe('Password Reset Mode', () => {
    it('should handle password reset with token', async () => {
      // Mock URL with reset token
      const mockLocation = {
        search: '?token=reset123&action=reset-password'
      };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        configurable: true
      });

      // Mock API call
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successful' })
      });

      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      const user = userEvent.setup();

      // Should switch to reset password mode
      await waitFor(() => {
        expect(screen.getByText('Nouveau mot de passe')).toBeInTheDocument();
      });

      // Enter new password
      const passwordInputs = screen.getAllByLabelText(/mot de passe/i);
      await user.type(passwordInputs[0], 'newpassword123');
      await user.type(passwordInputs[1], 'newpassword123');
      
      await user.click(screen.getByRole('button', { name: /modifier/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/reset-password'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              token: 'reset123',
              password: 'newpassword123'
            })
          })
        );
      });
    });

    it('should validate password confirmation match', async () => {
      const mockLocation = {
        search: '?token=reset123&action=reset-password'
      };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        configurable: true
      });

      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('Nouveau mot de passe')).toBeInTheDocument();
      });

      // Enter mismatched passwords
      const passwordInputs = screen.getAllByLabelText(/mot de passe/i);
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'differentpassword');
      
      await user.click(screen.getByRole('button', { name: /modifier/i }));

      // Should show validation error
      expect(screen.getByText(/mots de passe ne correspondent pas/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock failed API call
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      const user = userEvent.setup();
      
      await user.click(screen.getByText(/mot de passe oublié/i));
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });
    });

    it('should clear errors when switching modes', async () => {
      renderWithProviders(
        <AuthForm 
          onLogin={mockOnLogin} 
          onRegister={mockOnRegister}
          error="Login error"
        />
      );

      expect(screen.getByText('Login error')).toBeInTheDocument();

      const user = userEvent.setup();
      await user.click(screen.getByText(/créer un compte/i));

      // Error should be cleared when switching to registration
      expect(screen.queryByText('Login error')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      renderWithProviders(
        <AuthForm onLogin={mockOnLogin} onRegister={mockOnRegister} />
      );

      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('should show loading states appropriately', () => {
      renderWithProviders(
        <AuthForm 
          onLogin={mockOnLogin} 
          onRegister={mockOnRegister}
          isLoading={true}
        />
      );

      const button = screen.getByRole('button', { name: /se connecter/i });
      expect(button).toBeDisabled();
    });
  });
});