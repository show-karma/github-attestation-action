export const queryGetMergedPRsByAuthor = (owner: string, repository: string, after?: string) => {
  const query = `
  query {
    repository(owner: "${owner}", name: "${repository}") {
      pullRequests(states: MERGED, ${after ? `after: "${after}"` : ''}, first: 100) {
        nodes {
          id,
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
