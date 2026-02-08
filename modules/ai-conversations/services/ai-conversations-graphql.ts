export const CREATE_AI_CONVERSATION = `
  mutation CreateAIConversation($objects: [ai_conversationsInsertInput!]!) {
    insertIntoai_conversationsCollection(objects: $objects) {
      affectedCount
      records {
        id
        user_id
        user_role
        title
        description
        metadata
        previous_response_id
        last_message_at
        created_at
      }
    }
  }
`;

export const GET_USER_CONVERSATIONS = `
  query GetUserConversations(
    $filter: ai_conversationsFilter
    $limit: Int = 50
    $offset: Int = 0
    $sorting: [ai_conversationsOrderBy!] = [{ last_message_at: DescNullsLast }]
  ) {
    ai_conversationsCollection(
      filter: $filter
      first: $limit
      offset: $offset
      orderBy: $sorting
    ) {
      edges {
        node {
          id
          user_id
          user_role
          title
          description
          metadata
          previous_response_id
          last_message_at
          created_at
        }
      }
    }
  }
`;

export const GET_AI_CONVERSATION_BY_ID = `
  query GetAIConversationById($id: UUID!) {
    ai_conversationsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          user_id
          user_role
          title
          description
          metadata
          previous_response_id
          last_message_at
          created_at
        }
      }
    }
  }
`;

export const UPDATE_AI_CONVERSATION = `
  mutation UpdateAIConversation(
    $id: UUID!
    $title: String
    $description: String
    $previous_response_id: String
  ) {
    updateai_conversationsCollection(
      filter: { id: { eq: $id } }
      set: {
        title: $title
        description: $description
        previous_response_id: $previous_response_id
        last_message_at: "now()"
      }
    ) {
      affectedCount
      records {
        id
        title
        description
        previous_response_id
        last_message_at
      }
    }
  }
`;

