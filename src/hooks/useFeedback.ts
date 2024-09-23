import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import ky from "ky";
import { z } from "zod";

const FormSchema = z.object({
  address: z.string(),

  votingTime: z.string(),

  votingRating: z.string(),

  concernRating: z.string(),
  concernComment: z.string().optional(),

  confidenceRating: z.string(),
  confidenceComment: z.string().optional(),

  influenceRating: z.string(),
  influenceComment: z.string().optional(),
});

export type FeedbackForm = z.infer<typeof FormSchema>;

const formMap: FeedbackForm = {
  address: "45ea618e-403e-40b8-b610-88b6b1b63b6c",
  votingTime: "cd9c9bd0-0b16-4e3f-a28b-8a50cffe64c0",

  votingRating: "a4779d7d-8b78-4322-a101-6d4524e19a12",

  concernRating: "125df7e0-9622-428f-87a7-624b29df0b4f",
  concernComment: "71a745ae-e5d5-433b-badf-3a93e4e2326b",

  confidenceRating: "d5fd6cec-6b77-4c2d-8e76-91c181fd4ef3",
  confidenceComment: "c06e1e36-ec60-457c-a3d5-fc3429f85a35",

  influenceRating: "3cbf66ed-ed50-40bc-8043-dc9d18de1e9a",
  influenceComment: "e09bc091-c5f1-4b63-a76f-f70a1e5b8649",
} as const;

async function sendFeedback(feedback: FeedbackForm) {
  const addFormResponseItems = Object.entries(formMap).map(
    ([key, formFieldId]) => {
      const value = feedback[key as keyof typeof formMap];
      return {
        formFieldId,
        inputValue: { default: value },
      };
    }
  );
  return ky
    .post(`/api/deform`, {
      json: {
        operationName: "AddFormResponse",
        variables: {
          data: {
            formId: "25b6553b-b3f9-4b94-b62f-66fd2f955d57",
            addFormResponseItems,
          },
        },
        query:
          "mutation AddFormResponse($data: AddFormResponseInput!) { addFormResponse(data: $data) { id } }",
      },
    })
    .json<{ errors?: { message: string }[] }>()
    .then((r) => {
      if (r.errors?.length) {
        throw new Error(r.errors?.[0]?.message);
      }
      return r;
    });
}

export function useSendFeedback() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: sendFeedback,
    onError: (err) => {
      console.error(err);
      toast({ title: "Error submitting feedback", variant: "destructive" });
    },
  });
}
