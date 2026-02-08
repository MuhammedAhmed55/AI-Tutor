import { supabaseAdmin } from "@/lib/supabase/supabase-auth-client";
import { executeGraphQLBackend } from "@/lib/graphql-server";
import {
  CREATE_AI_CONVERSATION,
  GET_USER_CONVERSATIONS,
  GET_AI_CONVERSATION_BY_ID,
  UPDATE_AI_CONVERSATION,
} from "./ai-conversations-graphql";

export interface CreateAIConversationInput {
  userId: string;
  userRole: string;
  title?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  previousResponseId?: string | null;
}

export interface UpdateAIConversationInput {
  id: string;
  title?: string | null;
  description?: string | null;
  previousResponseId?: string | null;
}

export const aiConversationsService = {
  /**
   * Create a new conversation and return the created conversation ID
   */
  async createConversation(input: CreateAIConversationInput) {
    const {
      userId,
      userRole,
      title,
      description,
      metadata,
      previousResponseId,
    } = input;

    // Prefer GraphQL; fall back to Supabase admin if GraphQL is unavailable
    try {
      const response = await executeGraphQLBackend(CREATE_AI_CONVERSATION, {
        objects: [
          {
            user_id: userId,
            user_role: userRole,
            title: title ?? null,
            description: description ?? null,
            metadata: metadata ?? null,
            previous_response_id: previousResponseId ?? null,
            last_message_at: new Date().toISOString(),
          },
        ],
      });

      const records =
        response?.insertIntoai_conversationsCollection?.records ?? [];
      if (!records.length) {
        throw new Error("Failed to create AI conversation via GraphQL");
      }

      return records[0].id as string;
    } catch (error) {
      console.error(
        "Error creating ai_conversations via GraphQL, falling back to Supabase:",
        error
      );

      const { data, error: supabaseError } = await supabaseAdmin
        .from("ai_conversations")
        .insert({
          user_id: userId,
          user_role: userRole,
          title: title ?? null,
          description: description ?? null,
          last_message_at: new Date().toISOString(),
          metadata: metadata ?? null,
          previous_response_id: previousResponseId ?? null,
        })
        .select("id")
        .single();

      if (supabaseError) {
        console.error("Error creating ai_conversations:", supabaseError);
        throw supabaseError;
      }

      return data!.id as string;
    }
  },

  /**
   * Get conversations for a user
   */
  async getUserConversations(userId: string) {
    // Prefer GraphQL; fall back to Supabase admin if GraphQL is unavailable
    try {
      const response = await executeGraphQLBackend(GET_USER_CONVERSATIONS, {
        filter: { user_id: { eq: userId } },
        limit: 50,
        offset: 0,
      });

      const edges =
        response?.ai_conversationsCollection?.edges ?? [];

      return edges.map(
        (edge: {
          node: {
            id: string;
            title: string | null;
            description: string | null;
            last_message_at: string | null;
            created_at: string | null;
            previous_response_id: string | null;
          };
        }) => edge.node
      );
    } catch (error) {
      console.error(
        "Error fetching ai_conversations via GraphQL, falling back to Supabase:",
        error
      );

      const { data, error: supabaseError } = await supabaseAdmin
        .from("ai_conversations")
        .select(
          "id, title, description, last_message_at, created_at, previous_response_id"
        )
        .eq("user_id", userId)
        .order("last_message_at", { ascending: false })
        .limit(50);

      if (supabaseError) {
        console.error("Error fetching user conversations:", supabaseError);
        throw supabaseError;
      }

      return data || [];
    }
  },

  /**
   * Get a single conversation by ID
   */
  async getConversationById(id: string) {
    // Prefer GraphQL; fall back to Supabase admin if GraphQL is unavailable
    try {
      const response = await executeGraphQLBackend(GET_AI_CONVERSATION_BY_ID, {
        id,
      });

      const edge =
        response?.ai_conversationsCollection?.edges?.[0];

      return edge?.node ?? null;
    } catch (error) {
      console.error(
        "Error fetching ai_conversations via GraphQL, falling back to Supabase:",
        error
      );

      const { data, error: supabaseError } = await supabaseAdmin
        .from("ai_conversations")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (supabaseError) {
        console.error("Error fetching conversation:", supabaseError);
        throw supabaseError;
      }

      return data;
    }
  },

  /**
   * Update conversation with previousResponseId, title, and/or description
   */
  async updateConversation(input: UpdateAIConversationInput) {
    const { id, title, description, previousResponseId } = input;

    // Prefer GraphQL; fall back to Supabase admin if GraphQL is unavailable
    try {
      await executeGraphQLBackend(UPDATE_AI_CONVERSATION, {
        id,
        title: title ?? null,
        description: description ?? null,
        previous_response_id: previousResponseId ?? null,
      });
    } catch (error) {
      console.error(
        "Error updating ai_conversations via GraphQL, falling back to Supabase:",
        error
      );

      const updateData: {
        previous_response_id?: string | null;
        title?: string | null;
        description?: string | null;
        last_message_at?: string;
      } = {
        last_message_at: new Date().toISOString(),
      };

      if (previousResponseId !== undefined) {
        updateData.previous_response_id = previousResponseId;
      }

      if (title !== undefined) {
        updateData.title = title;
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      const { error: supabaseError } = await supabaseAdmin
        .from("ai_conversations")
        .update(updateData)
        .eq("id", id);

      if (supabaseError) {
        console.error("Error updating ai_conversations:", supabaseError);
        throw supabaseError;
      }
    }
  },
};
