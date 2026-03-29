import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetTags as useApiGetTags,
  useCreateTag as useApiCreateTag,
  useDeleteTag as useApiDeleteTag
} from "@workspace/api-client-react";

export function useTags() {
  return useApiGetTags();
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useApiCreateTag({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      }
    }
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useApiDeleteTag({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      }
    }
  });
}
