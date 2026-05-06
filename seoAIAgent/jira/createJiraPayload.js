export function createJiraPayload(issue, url) {
  return {
    fields: {
      project: {
        key: "SEO",
      },
      summary: issue.title || "SEO Issue",
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `URL: ${url}\n\nDescription:\n${issue.description || "No description"}\n\nSuggested Fix:\n${issue.fix || "N/A"}`,
              },
            ],
          },
        ],
      },
      issuetype: {
        name: "Bug",
      },
      priority: {
        name: issue.priority,
      },
    },
  };
}
