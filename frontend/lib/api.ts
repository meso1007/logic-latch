export const pollJob = async (
    jobId: number,
    apiBaseUrl: string,
    token: string,
    onLogout: () => void
): Promise<any> => {
    const maxRetries = 60; // 5 minutes
    let retries = 0;

    while (retries < maxRetries) {
        const response = await fetch(`${apiBaseUrl}/api/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
            onLogout();
            throw new Error("Unauthorized");
        }

        if (!response.ok) {
            throw new Error("Failed to check job status");
        }

        const job = await response.json();

        if (job.status === "completed") {
            return job.result;
        }

        if (job.status === "failed") {
            throw new Error(job.error || "Job failed");
        }

        // Wait 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
        retries++;
    }

    throw new Error("Job timed out");
};
