"use server";

import { emailService } from "@/lib/email-service";
import { supabase, supabaseAdmin } from "@/lib/supabase/supabase-auth-client";
import { createClient } from "@/lib/supabase/supabase-server-client";

import { rolesService } from "@/modules/roles";
import { usersService } from "@/modules/users";
import { cookies } from "next/headers";
import { User } from "@/types/types";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export interface AuthSignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role_id?: string;
}

export type AuthServiceError = {
  type: "error";
  message: string;
};

const createError = (message: string): AuthServiceError => ({
  type: "error",
  message,
});

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function signUp({
  email,
  password,
  firstName,
  lastName,
  role_id = "",
}: AuthSignupData): Promise<AuthServiceError | unknown> {
  try {
    const cookieStore = await cookies();
    const supabaseClient = await createClient(cookieStore);
    // First check if user exists with the given email
    const existingUser = await usersService.getUserByEmail({
      email: {
        ilike: email,
      },
    });

    if (existingUser) {
      return createError("User already registered with this email");
    }

    // Create the user in Supabase Auth if not exists
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });

    if (error) {
      console.error("Auth signUp error:", error);
      return createError(error.message);
    }

    if (data?.user) {
      try {
        // Get the default user role using GraphQL
        const roleId = await rolesService.getRoleByName();
        const payload = {
          id: data?.user?.id,
          email: data?.user?.email,
          role_id: role_id || roleId,
          first_name: firstName || null,
          last_name: lastName || null,
          full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim() || null,
          is_active: true,
        };
        // Insert the user into the users table using GraphQL
        const result = await usersService.insertUser(payload as User);
        if (result && typeof result === 'string') {
          return createError(result)
        }
      } catch (profileError) {
        console.error("Error in user profile creation:", profileError);
        return createError(
          profileError instanceof Error
            ? profileError.message
            : "Failed to create user profile"
        );
      }0
    }

    return data;
  } catch (error) {
    console.error("Unexpected signUp error:", error);
    return createError(
      error instanceof Error ? error.message : "Failed to sign up"
    );
  }
}

export async function signIn(email: string, password: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Auth signIn error:", error);
    return createError(
      error.message || "Invalid login credentials. Please try again."
    );
  }

  return data;
}

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Auth signOut error:", error);
    return createError(error.message || "Failed to sign out");
  }
}

export async function sendInvites(emails: string[]) {
  for (const email of emails) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
    });
    if (error) {
      console.error("Auth sendInvites error:", error);
      return createError(error.message || "Failed to create invited user");
    }

    emailService.sendInviteEmail(
      email,
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite/${data?.user?.id}`
    );
    if (data?.user) {
      // Wait a moment for the auth user to be fully created before inserting into users table
      await delay(2000);
      try {
        // Get the default user role using GraphQL
        const roleId = await rolesService.getRoleByName();
        const payload = {
          id: data?.user?.id,
          email: data?.user?.email,
          role_id: roleId,
          first_name: null,
          last_name: null,
          is_active: true,
        };
        // Insert the user into the users table using GraphQL
        await usersService.insertUser(payload as User);
      } catch (profileError) {
        console.error("Error in profile_image creation:", profileError);
        return createError("Failed to create user profile for invite");
      }
    }
    return data;
  }
}

export async function resendVerificationEmail(email: string) {

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });
  console.log("🚀 ~ resendVerificationEmail ~ data:", data)

  if (error || !data?.user) {
    console.error("Auth resendVerificationEmail error:", error);
    return createError(
      !data.user ? "User not found" : error?.message || "Failed to resend verification email. Try again later."
    );
  }
  return data;
}

export async function acceptInvite(token: string, password: string) {
  try {
    // Exchange the token for a session
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.updateUserById(token, {
        password: password,
        email_confirm: true,
      });
    if (sessionError) {
      return createError("Invalid or expired invite token");
    }

    if (!sessionData?.user) {
      return createError("No user found for this token");
    }
    return sessionData;
  } catch (error) {
    console.error("Error in acceptInvite:", error);
    return createError(
      error instanceof Error ? error.message : "Failed to accept invite"
    );
  }
}

export async function deleteUser(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    }
  );
  if (!response.ok) {
    console.error("Auth deleteUser error:", response.statusText);
    return createError("Failed to delete user");
  }
  await signOut();
  return response.json();
}

export async function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  return supabase.auth.onAuthStateChange(callback);
}

export async function signInWithOtp(email: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error("Auth signInWithOtp error:", error);
    return createError(
      error.message || "Failed to send OTP. Please try again later."
    );
  }
  return { success: true };
}

export async function verifyOtp(email: string, token: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: "email",
  });

  if (error) {
    console.error("Auth verifyOtp error:", error);
    return createError(error.message || "Invalid or expired OTP");
  }
  return data;
}

export async function signInWithOAuth(
  provider: "google" | "apple" | "facebook",
  redirectTo: string
) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Auth signInWithOAuth error:", error);
    return createError(
      error.message || "Failed to sign in with social provider"
    );
  }
  return data;
}

export async function resetPasswordForEmail(email: string, redirectTo: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo,
  });

  if (error) {
    console.error("Auth resetPasswordForEmail error:", error);
    return createError(
      error.message ||
        "Failed to send password reset email. Please try again later."
    );
  }
  return { success: true };
}

export async function updatePassword(password: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error("Auth updatePassword error:", error);
    return createError(error.message || "Failed to update password");
  }
  return { success: true };
}

export async function verifyRecoveryOtp(tokenHash: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (error) {
    console.error("Auth verifyRecoveryOtp error:", error);
    return createError(
      error.message || "Invalid or expired recovery token. Please try again."
    );
  }
  return data;
}

export async function setSession(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.error("Auth setSession error:", error);
    return createError(error.message || "Failed to set session");
  }
  return data;
}
