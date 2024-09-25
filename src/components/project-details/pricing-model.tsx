import { ProjectPricingModel } from '@/__generated__/api/agora.schemas';
import { Heading } from '@/components/ui/headings';
import { CustomAccordion } from '../custom-accordion';
import { Card, CardContent } from '../ui/card';

export function PricingModel({
  pricingModel,
}: {
  pricingModel?: ProjectPricingModel;
}) {
  if (!pricingModel) return null;
  const { type, details } = pricingModel;
  const formatType = (type: string) => {
    if (type === 'pay_to_use') {
      return type.replace(/_/g, '-');
    }
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="flex flex-col gap-2 mb-12">
      <Heading className="text-sm font-medium leading-5" variant="h1">
        Pricing Model
      </Heading>
      {type === 'free' ? (
        <Card className="shadow-none">
          <CardContent className="py-2.5 px-3">
            <div className="capitalize text-sm font-medium leading-5">
              {formatType(type ?? '')}
            </div>
          </CardContent>
        </Card>
      ) : (
        <CustomAccordion
          value={type ?? ''}
          trigger={
            <div className="capitalize text-sm font-medium leading-5">
              {formatType(type ?? '')}
            </div>
          }
        >
          <div className="p-2">{details}</div>
        </CustomAccordion>
      )}
    </div>
  );
}
