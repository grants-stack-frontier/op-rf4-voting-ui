import { ProjectGrantsAndFunding } from '@/__generated__/api/agora.schemas';
import { RiLink, RiMoneyDollarCircleFill, RiTimeFill } from '@remixicon/react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../../../public/logo.png';
import { CustomAccordion } from '../custom-accordion';
import { Card, CardContent } from '../ui/card';
import { Heading } from '../ui/headings';

export function GrantsFundingRevenue({
  grantsAndFunding,
}: {
  grantsAndFunding?: ProjectGrantsAndFunding;
}) {
  if (
    !grantsAndFunding ||
    ((!grantsAndFunding.grants || grantsAndFunding.grants.length === 0) &&
      (!grantsAndFunding.ventureFunding ||
        grantsAndFunding.ventureFunding.length === 0) &&
      (!grantsAndFunding.revenue || grantsAndFunding.revenue.length === 0) &&
      (!grantsAndFunding.investment ||
        grantsAndFunding.investment.length === 0) &&
      (!grantsAndFunding.investments ||
        grantsAndFunding.investments.length === 0))
  ) {
    return (
      <div className="flex flex-col gap-2">
        <Heading className="text-sm font-medium leading-5" variant="h1">
          Grants and investment
        </Heading>
        <Card className="shadow-none">
          <CardContent className="px-3 py-2.5">
            <p className="text-sm font-medium">None</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatGrantName = (name: string) => {
    if (name === 'retroFunding') return 'Retro Funding';
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderItem = (item: any, type: string, index: number) => {
    const { amount, date, details, link, grant, year, fundingRound } = item;
    const isUSDType = type === 'Investment' || type === 'Venture Funding';
    const formattedAmount =
      amount && Number(amount) > 0
        ? new Intl.NumberFormat('en-US', {
            style: isUSDType ? 'currency' : 'decimal',
            currency: isUSDType ? 'USD' : undefined,
            maximumFractionDigits: 0,
          }).format(Number(amount))
        : amount;

    const getHeaderText = () => {
      if (type === 'Grant') {
        if (grant === 'retroFunding') {
          return 'Retro Funding';
        } else if (grant) {
          return `Grant: ${formatGrantName(grant)}`;
        } else {
          return 'Grant';
        }
      }
      return `${type}${grant ? `: ${formatGrantName(grant)}` : ''}`;
    };

    const header = (
      <>
        <p className="truncate max-w-[200px] font-medium text-sm">
          {getHeaderText()}
        </p>
        {link && (
          <Link
            href={link}
            className="flex items-center gap-2 hover:underline"
            target="_blank"
          >
            <RiLink className="h-5 w-5" />{' '}
            <p className="truncate max-w-[200px] text-sm font-normal leading-5">
              {link}
            </p>
          </Link>
        )}
        {fundingRound && (
          <div className="flex items-center gap-2 text-sm font-normal leading-5">
            <RiTimeFill className="h-5 w-5" />
            Round {fundingRound}
          </div>
        )}
        {(date || year) && (
          <div className="flex items-center gap-2 text-sm font-normal leading-5">
            <RiTimeFill className="h-5 w-5" />
            {date || year}
          </div>
        )}
        {formattedAmount && (
          <div className="flex items-center gap-2 text-sm font-normal leading-5">
            {isUSDType ? (
              <RiMoneyDollarCircleFill className="h-5 w-5" />
            ) : (
              <Image src={Logo.src} alt="Logo" width={20} height={20} />
            )}
            {formattedAmount} {isUSDType ? '' : 'OP'}
          </div>
        )}
      </>
    );

    if (details) {
      return (
        <CustomAccordion
          key={`${type}-${grant || amount}-${index}`}
          value={grant || amount || ''}
          trigger={header}
        >
          <div className="px-3">{details}</div>
        </CustomAccordion>
      );
    }

    return (
      <Card className="shadow-none" key={`${type}-${grant || amount}-${index}`}>
        <CardContent className="flex items-center gap-3 px-2.5 py-3">
          {header}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-sm font-medium leading-5" variant="h1">
        Grants and investment
      </Heading>
      {grantsAndFunding.grants?.map((item, index) =>
        renderItem(item, 'Grant', index)
      )}
      {grantsAndFunding.ventureFunding?.map((item, index) =>
        renderItem(item, 'Venture Funding', index)
      )}
      {grantsAndFunding.revenue?.map((item, index) =>
        renderItem(item, 'Revenue', index)
      )}
      {grantsAndFunding.investments?.map((item, index) =>
        renderItem(item, 'Investment', index)
      )}
      {grantsAndFunding.investment?.map((item, index) =>
        renderItem(item, 'Investment', index)
      )}
    </div>
  );
}
