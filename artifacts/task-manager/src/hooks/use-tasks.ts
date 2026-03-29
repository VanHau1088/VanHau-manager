import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetTasks as useApiGetTasks,
  useCreateTask as useApiCreateTask,
  useUpdateTask as useApiUpdateTask,
  useDeleteTask as useApiDeleteTask
} from "@workspace/api-client-react";
import type { CreateTaskInput, UpdateTaskInput } from "@workspace/api-client-react/src/generated/api.schemas";

export function useTasks(tagIds?: string) {
  return useApiGetTasks({ tagIds });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useApiCreateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      }
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useApiUpdateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      }
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useApiDeleteTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      }
    }
  });
}
