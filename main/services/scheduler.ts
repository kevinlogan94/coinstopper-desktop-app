import { ipcMain } from "electron";
import { exec } from "child_process";
import { promisify } from "util";

export const registerSchedulerMethods = () => {
  const execAsync = promisify(exec);

  ipcMain.handle("scheduler-get-tasks", async () => {
    try {
      const command = "schtasks /query /fo LIST";
      const { stdout } = await execAsync(command);
      return stdout; // Return the command's output
    } catch (error) {
      console.error("Failed to list tasks:", error);
      throw new Error("Error listing tasks");
    }
  });

  ipcMain.handle(
    "scheduler-create-task",
    async (_event, taskName: string, scriptPath: string, schedule: string) => {
      try {
        const command = `schtasks /create /tn "${taskName}" /tr "${scriptPath}" /sc ${schedule}`;
        const { stdout } = await execAsync(command);
        return stdout; // Return the success message
      } catch (error) {
        console.error("Failed to create task:", error);
        throw new Error(`Error creating task: ${error.message}`);
      }
    }
  );

  ipcMain.handle("scheduler-delete-task", async (_event, taskName: string) => {
    try {
      const command = `schtasks /delete /tn "${taskName}" /f`;
      const { stdout } = await execAsync(command);
      return stdout; // Return the success message
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw new Error(`Error deleting task: ${error.message}`);
    }
  });
};
