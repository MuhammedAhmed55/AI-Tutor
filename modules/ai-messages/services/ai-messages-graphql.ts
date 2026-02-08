export const INSERT_AI_MESSAGE = `
  mutation InsertAIMessage($objects: [ai_messagesInsertInput!]!) {
    insertIntoai_messagesCollection(objects: $objects) {
      affectedCount
      records {
        id
        conversation_id
        user_id
        role
        content
        provider_response_id
        metadata
        created_at
      }
    }
  }
`;

export const GET_CONVERSATION_MESSAGES = `
  query GetConversationMessages(
    $filter: ai_messagesFilter
    $limit: Int = 1000
    $offset: Int = 0
    $sorting: [ai_messagesOrderBy!] = [{ created_at: AscNullsLast }]
  ) {
    ai_messagesCollection(
      filter: $filter
      first: $limit
      offset: $offset
      orderBy: $sorting
    ) {
      edges {
        node {
          id
          conversation_id
          user_id
          role
          content
          provider_response_id
          metadata
          created_at
        }
      }
    }
  }
`;

