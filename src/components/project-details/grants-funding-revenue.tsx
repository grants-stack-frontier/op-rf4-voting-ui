import { ProjectGrantsAndFunding } from "@/__generated__/api/agora.schemas";
import { RiLink, RiMoneyDollarCircleFill, RiTimeFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";
import { CustomAccordion } from "../custom-accordion";
import { Card, CardContent } from "../ui/card";
import { Heading } from "../ui/headings";

export function GrantsFundingRevenue({ grantsAndFunding }: { grantsAndFunding?: ProjectGrantsAndFunding }) {
  if (!grantsAndFunding || grantsAndFunding.grants?.length === 0 && grantsAndFunding.ventureFunding?.length === 0 && grantsAndFunding.revenue?.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-sm font-medium leading-5" variant="h1">Grants & Investment</Heading>
      {grantsAndFunding.grants?.map(({ grant, amount, date, details, link }, index) => {
        const formattedAmount = amount && Number(amount) > 0 ? new Intl.NumberFormat('en-US').format(Number(amount)) : amount;
        if (!details) {
          return (
            <Card className="shadow-none" key={index}>
              <CardContent className="flex items-center gap-2 px-2.5 py-3">
                {grant && <p className="truncate max-w-[200px] text-sm">Grant: {grant}</p>}
                {link && (
                  <Link href={link} className="flex items-center gap-2 hover:underline" target="_blank">
                    <RiLink className="h-5 w-5" /> <p className="truncate max-w-[200px] text-sm font-medium leading-5">{link}</p>
                  </Link>
                )}
                {formattedAmount && (
                  <div className="flex items-center gap-2 text-sm font-medium leading-5">
                    <Image src={Logo.src} alt="Logo" width={20} height={20} />
                    {formattedAmount} OP
                  </div>
                )}
                {date && (
                  <div className="flex items-center gap-2 text-sm font-medium leading-5">
                    <RiTimeFill className="h-5 w-5" />
                    {date}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        };

        return (
          <CustomAccordion
            key={index}
            value={grant ?? ''}
            trigger={
              <>
                {grant && <p className="truncate max-w-[200px] text-sm">Grant: {grant}</p>}
                {link && (
                  <Link href={link} className="flex items-center gap-2 hover:underline" target="_blank">
                    <RiLink className="h-5 w-5" /> <p className="truncate max-w-[200px] text-sm font-medium leading-5">{link}</p>
                  </Link>
                )}
                {formattedAmount && (
                  <div className="flex items-center gap-2 text-sm font-medium leading-5">
                    <Image src={Logo.src} alt="Logo" width={20} height={20} />
                    {formattedAmount} OP
                  </div>
                )}
                {date && (
                  <div className="flex items-center gap-2 text-sm font-medium leading-5">
                    <RiTimeFill className="h-5 w-5" />
                    {date}
                  </div>
                )}
              </>
            }
          >
            {details && (
              <div className="p-2">
                {details}
              </div>
            )}
          </CustomAccordion>
        )
      })}
      {
        grantsAndFunding.ventureFunding?.map(({ amount, details, year }, index) => {
          if (!details) {
            return (
              <Card className="shadow-none" key={index}>
                <CardContent className="flex items-center gap-2 px-2.5 py-3">
                  <span>Funding:</span>
                  <div className="flex items-center gap-2">
                    <RiMoneyDollarCircleFill className="h-4 w-4" /> <p>{amount || ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiTimeFill className="h-5 w-5" /> <p>{year}</p>
                  </div>
                </CardContent>
              </Card>
            );
          };
          return (
            <CustomAccordion key={index} value={amount || ''} trigger={
              <>
                <span>Funding:</span>
                <div className="flex items-center gap-2">
                  <RiMoneyDollarCircleFill className="h-4 w-4" /> <p>{amount || ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <RiTimeFill className="h-5 w-5" /> <p>{year}</p>
                </div>
              </>
            }>
              {details && (
                <div className="p-2">
                  {details}
                </div>
              )}
            </CustomAccordion>
          );
        })
      }
      {
        grantsAndFunding.revenue?.map(({ amount, details }, index) => {
          if (!details) {
            return (
              <Card className="shadow-none" key={index}>
                <CardContent className="flex items-center gap-2 px-2.5 py-3">
                  <span>Revenue:</span>
                  <div className="flex items-center gap-2">
                    <RiMoneyDollarCircleFill className="h-4 w-4" /> <p>{amount || ''}</p>
                  </div>
                </CardContent>
              </Card>
            );
          };
          return (
            <CustomAccordion key={index} value={amount || ''} trigger={
              <>
                <span>Revenue:</span>
                <div className="flex items-center gap-2">
                  <RiMoneyDollarCircleFill className="h-4 w-4" /> <p>{amount || ''}</p>
                </div>
              </>
            }>
              {details && (
                <div className="p-2">
                  {details}
                </div>
              )}
            </CustomAccordion>
          );
        })
      }
    </div>
  );
}