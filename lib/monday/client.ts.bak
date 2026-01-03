const MONDAY_API_URL = "https://api.monday.com/v2"

interface MondayQueryOptions {
  query: string
  variables?: Record<string, unknown>
}

interface MondayResponse<T = unknown> {
  data: T
  errors?: Array<{ message: string }>
}

export async function mondayQuery<T = unknown>({ query, variables }: MondayQueryOptions): Promise<MondayResponse<T>> {
  const apiKey = process.env.MONDAY_API_KEY

  if (!apiKey) {
    throw new Error("MONDAY_API_KEY environment variable is not set")
  }

  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    throw new Error(`Monday.com API error: ${response.statusText}`)
  }

  return response.json()
}

// Common Monday.com queries for the Retention Portal
export async function getLeadsByStatus(boardId: string, status: string) {
  const query = `
    query GetLeadsByStatus($boardId: ID!, $status: String!) {
      boards(ids: [$boardId]) {
        items_page(
          query_params: {
            rules: [{ column_id: "status", compare_value: [$status] }]
          }
        ) {
          items {
            id
            name
            column_values {
              id
              text
              value
            }
          }
        }
      }
    }
  `

  return mondayQuery({
    query,
    variables: { boardId, status },
  })
}

export async function updateLeadStatus(itemId: string, boardId: string, columnId: string, status: string) {
  const query = `
    mutation UpdateLeadStatus($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(
        board_id: $boardId
        item_id: $itemId
        column_id: $columnId
        value: $value
      ) {
        id
      }
    }
  `

  return mondayQuery({
    query,
    variables: {
      boardId,
      itemId,
      columnId,
      value: JSON.stringify({ label: status }),
    },
  })
}

export async function getBoardItems(boardId: string) {
  const query = `
    query GetBoardItems($boardId: ID!) {
      boards(ids: [$boardId]) {
        id
        name
        items_page {
          items {
            id
            name
            column_values {
              id
              text
              value
              type
            }
          }
        }
      }
    }
  `

  return mondayQuery({
    query,
    variables: { boardId },
  })
}

export async function assignLeadToAgent(itemId: string, boardId: string, agentColumnId: string, agentId: string) {
  const query = `
    mutation AssignLead($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(
        board_id: $boardId
        item_id: $itemId
        column_id: $columnId
        value: $value
      ) {
        id
      }
    }
  `

  return mondayQuery({
    query,
    variables: {
      boardId,
      itemId,
      columnId: agentColumnId,
      value: JSON.stringify({ personsAndTeams: [{ id: agentId, kind: "person" }] }),
    },
  })
}
