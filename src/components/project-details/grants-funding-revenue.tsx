import { ProjectGrantsAndFunding } from "@/__generated__/api/agora.schemas";
import { CircleDollarSign, Clock3, Link2 } from "lucide-react";
import Image from "next/image";
import Logo from "../../../public/logo.png";
import { CustomAccordion } from "../custom-accordion";

export function GrantsFundingRevenue({ grantsAndFunding }: { grantsAndFunding?: ProjectGrantsAndFunding }) {
  if (!grantsAndFunding || grantsAndFunding.grants?.length === 0 && grantsAndFunding.ventureFunding?.length === 0 && grantsAndFunding.revenue?.length === 0) return null;

  return (
    <>
      <p className="font-medium">Grants & Investments</p>
      {grantsAndFunding.grants?.map(({ grant, amount, date, details, link }, index) => {
        const formattedAmount = amount && Number(amount) > 0 ? new Intl.NumberFormat('en-US').format(Number(amount)) : amount;
        return (
          <CustomAccordion
            value={grant || ''}
            trigger={
              <>
                <p className="truncate max-w-[200px] text-sm">Grant: {grant}</p>
                {link && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 -rotate-45" /> <p className="truncate max-w-[200px] text-sm">{link}</p>
                  </div>
                )}
                {formattedAmount && (
                  <div className="flex items-center gap-2 text-sm">
                    <Image src={Logo.src} alt="Logo" width={20} height={20} />
                    {formattedAmount} OP
                  </div>
                )}
                {date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock3 className="h-4 w-4" />
                    {date}
                  </div>
                )}
              </>
            }
            key={index}>
            <div className="p-2">
              {details}
            </div>
          </CustomAccordion>
        );
      })}
      {
        grantsAndFunding.ventureFunding?.map(({ amount, details, year }, index) => {
          return (
            <CustomAccordion value={amount || ''} trigger={
              <>
                <span>Funding:</span>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4" /> <p>{amount || ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" /> <p>{year}</p>
                </div>
              </>
            } key={index}>
              <div className="p-2">
                {details}
              </div>
            </CustomAccordion>
          );
        })
      }
      {
        grantsAndFunding.revenue?.map(({ amount, details }, index) => {
          return (
            <CustomAccordion value={amount || ''} trigger={
              <>
                <span>Revenue:</span>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4" /> <p>{amount || ''}</p>
                </div>
              </>
            } key={index}>
              <div className="p-2">
                {details}
              </div>
            </CustomAccordion>
          );
        })
      }
    </>
  );
}