export const queryGetMergedPRsByAuthor = (owner: string, repository: string, after?: string) => {
  const query = `
  query {
    repository( ${owner ? `owner: "${owner}"` : ''}, name: "${repository}") {
      pullRequests(states: MERGED, ${after ? `after: "${after}"` : ''}, first: 100) {
        nodes {
          id,
          title,
          permalink
          baseRefName
          author {
            login
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  `;

  return query;
}

export const queryPrByAuthor = (owner: string, repository: string, title: string) => {
  const query = `
  query {
    repository( ${owner ? `owner: "${owner}"` : ''}, name: "${repository}") {
      pullRequests(title: ${title}}, first: 100) {
        nodes {
          id,
          title,
          permalink
          baseRefName
          deletions
					additions
          author {
            login
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  `;

  return query;
}

