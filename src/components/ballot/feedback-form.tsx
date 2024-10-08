import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Heading } from '../ui/headings';
import { Badge } from '../ui/badge';

import {
  FormProvider,
  UseFormRegister,
  useController,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { ChevronLeft } from 'lucide-react';
import { PropsWithChildren, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { FeedbackForm, useSendFeedback } from '@/hooks/useFeedback';
import { FormMessage } from '../ui/form';

export function Form({
  children,
  defaultValues,
}: PropsWithChildren<{ defaultValues: Record<string, unknown> }>) {
  const form = useForm({ defaultValues });

  return <FormProvider {...form}>{children}</FormProvider>;
}

export function Feedback({ onSubmit = () => {} }) {
  const form = useFormContext<FeedbackForm & { index: number }>();
  const { handleSubmit, register, setValue, watch } = form;
  const index = watch('index') ?? 0;

  const { mutate, isPending } = useSendFeedback();

  const questions = useMemo(() => createQuestions(register), [register]);
  const { title, description, children } = questions[index];
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (index < questions.length - 1) {
          setValue('index', index + 1);
        } else {
          mutate(values, {
            onSuccess: onSubmit,
            onError: onSubmit, // Skips feedback if error (for testing)
          });
        }
      })}
    >
      <input type="hidden" {...register('index')} />
      <div className="space-y-8">
        <div className="flex justify-center">
          <Badge variant={'secondary'} className="text-muted-foreground">
            {index + 1} of {questions.length}
          </Badge>
        </div>
        <div className="space-y-2">
          <Heading variant={'h3'} className="text-center">
            {title}
          </Heading>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
        {index > 0 && (
          <Button
            icon={ChevronLeft}
            variant="ghost"
            size={'icon'}
            type="button"
            className="absolute -top-[28px] left-2 rounded-full"
            disabled={index === 0}
            onClick={() => setValue('index', index - 1)}
          />
        )}
        <Button
          className="w-full"
          variant={'destructive'}
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

function createQuestions(
  register: UseFormRegister<FeedbackForm & { index: number }>
) {
  return [
    {
      title: 'How much time did you spend on voting in this round (in hours)?',
      children: (
        <Input
          {...register('votingTime', { required: true })}
          type="number"
          placeholder="Ex: 10 hours"
        />
      ),
    },
    {
      title: 'Please rate the voting experience',
      children: (
        <SelectForm
          key="voting"
          name="voting"
          hideComment
          options={Array(10)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0 ? '(terrible)' : index === 9 ? '(amazing ✨)' : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    // {
    //   title: `Did you observe any behavior among your fellow badgeholders that could be considered one of the following (select all that apply)?`,
    //   children: <Behaviors />,
    // },
    {
      title:
        'How worried are you about detrimental behavior among badgeholders influencing the allocation of Retro Funding in this round?',
      description:
        'Examples are collusion, bribery, self-dealing, or other behaviors at odds with the goals of the Collective.',
      children: (
        <SelectForm
          key="concern"
          name="concern"
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(not worried)'
                  : index === 3
                    ? '(somewhat worried)'
                    : index === 6
                      ? '(very worried)'
                      : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    {
      title:
        'Given the design of this round, how confident do you feel that OP rewards will be allocated efficiently to the most deserving projects?',
      children: (
        <SelectForm
          key="confidence"
          name="confidence"
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(very low confidence)'
                  : index === 3
                    ? '(some confidence)'
                    : index === 6
                      ? '(very high confidence)'
                      : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    {
      title:
        'To what extent did the “Grants and investment” information influence your token allocation among projects?',
      children: (
        <SelectForm
          key="influence"
          name="influence"
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(did not influence my token allocation)'
                  : index === 6
                    ? '(had a large influence on my token allocation)'
                    : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    // {
    //   title: "To what extent do you trust the opinions of other badgeholders?",
    //   children: (
    //     <SelectForm
    //       key="trust"
    //       name="trust"
    //       options={Array(7)
    //         .fill(0)
    //         .map((_, index) => ({
    //           label: `${index + 1} ${
    //             index === 0
    //               ? "(very low trust)"
    //               : index === 3
    //               ? "(some trust)"
    //               : index === 6
    //               ? "(very high trust)"
    //               : ""
    //           }`,
    //           value: String(index + 1),
    //         }))}
    //     />
    //   ),
    // },
    // QUESTION: Are we keeping the rest of these questions?
    // {
    //   title:
    //     "How would you rate your knowledge on the arguments for or against deducting external funding (e.g., VC funding, Optimism grants, or other grants) from Retro Funding rewards?",
    //   children: (
    //     <SelectForm
    //       key="knowledge"
    //       name="knowledge"
    //       options={Array(7)
    //         .fill(0)
    //         .map((_, index) => ({
    //           label: `${index + 1} ${
    //             index === 0
    //               ? "(very low knowledge)"
    //               : index === 3
    //               ? "(some knowledge)"
    //               : index === 6
    //               ? "(very high knowledge)"
    //               : ""
    //           }`,
    //           value: String(index + 1),
    //         }))}
    //     />
    //   ),
    // },

    // {
    //   title:
    //     "How satisfied do you feel with the definition of profit, compared to round 4?",
    //   description:
    //     "Definition: Impact = Award in OP, no past funding, grants, or revenue are deducted from Projects Retro Funding rewards",
    //   children: (
    //     <SelectForm
    //       key="satisfaction"
    //       name="satisfaction"
    //       options={Array(7)
    //         .fill(0)
    //         .map((_, index) => ({
    //           label: `${index + 1} ${
    //             index === 0
    //               ? "(not satisfied)"
    //               : index === 3
    //               ? "(somewhat satisfied)"
    //               : index === 6
    //               ? "(very satisfied)"
    //               : ""
    //           }`,
    //           value: String(index + 1),
    //         }))}
    //     />
    //   ),
    // },
    // {
    //   title: "How understandable and clear did you find the impact metrics?",
    //   children: (
    //     <SelectForm
    //       key="understandable"
    //       name="understandable"
    //       options={Array(7)
    //         .fill(0)
    //         .map((_, index) => ({
    //           label: `${index + 1} ${
    //             index === 0
    //               ? "(not understandable)"
    //               : index === 3
    //               ? "(somewhat understandable)"
    //               : index === 6
    //               ? "(very clear)"
    //               : ""
    //           }`,
    //           value: String(index + 1),
    //         }))}
    //     />
    //   ),
    // },
    // {
    //   title:
    //     "How confident are you in the data sources and trust signals used for the impact metrics?",
    //   children: (
    //     <SelectForm
    //       key="confidence_data"
    //       name="confidence_data"
    //       options={Array(7)
    //         .fill(0)
    //         .map((_, index) => ({
    //           label: `${index + 1} ${
    //             index === 0
    //               ? "(not confident)"
    //               : index === 3
    //               ? "(somewhat confident)"
    //               : index === 6
    //               ? "(very confident)"
    //               : ""
    //           }`,
    //           value: String(index + 1),
    //         }))}
    //     />
    //   ),
    // },
  ];
}

function SelectForm({
  name = '',
  options = [],
  hideComment,
}: {
  name: string;
  hideComment?: boolean;
  options: { value: string; label: string }[];
}) {
  const _name = `${name}Rating`;
  const { control, watch, register, formState } = useFormContext();
  const { field } = useController({ name: _name, control });

  return (
    <div className="space-y-2">
      <Select
        required
        value={field.value}
        defaultValue={field.value}
        onValueChange={field.onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!hideComment && (
        <Textarea
          {...register(`${name}Comment`)}
          placeholder="Please feel free to elaborate here. Reminder that these responses are anonymous..."
        />
      )}
    </div>
  );
}
