
const token = '7~QVTYU39aBffGZ9Z7n3PmUmWTw4LeyTAk96RKv8K8RTtBUwXcQHEAyZNuzLtn8HHx';
const courseId = '11839270';
const userId = '116449000'; // Can be pulled from the API if needed

export async function getAssignments() {
  const url = `https://canvas.instructure.com/api/v1/courses/${courseId}/assignments`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const assignments = await res.json();

  // Fetch each submission status
  const submissionChecks = assignments.map(async (a) => {
    const subRes = await fetch(
      `https://canvas.instructure.com/api/v1/courses/${courseId}/assignments/${a.id}/submissions/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const submission = await subRes.json();
    return {
      name: a.name,
      dueDate: a.due_at,
      submitted: submission.workflow_state === 'submitted',
      submittedAt: submission.submitted_at
    };
  });

  return Promise.all(submissionChecks);
}

export function evaluateHealth(assignments) {
  const now = new Date();
  let healthChange = 0;

  assignments.forEach(a => {
    const due = new Date(a.dueDate);
    if (!a.submitted || new Date(a.submittedAt) > due) {
      healthChange -= 10;
    } else {
      healthChange += 5;
    }
  });

  return healthChange;
}