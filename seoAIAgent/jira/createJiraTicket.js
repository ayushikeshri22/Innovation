import axios from "axios";


export async function createJiraTicket(payload) {
  const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
  const EMAIL = process.env.EMAIL;
  const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
  const auth = Buffer.from(`${EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

  // console.log("Email and API Token:", EMAIL, JIRA_API_TOKEN);
  const response = await axios.post(
    `${JIRA_BASE_URL}/rest/api/3/issue`,
    payload,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
