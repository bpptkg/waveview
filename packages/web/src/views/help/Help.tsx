import { Link } from '@fluentui/react-components';
import { ArrowUpRightRegular, FaxRegular, GlobeRegular, LocationRegular, MailRegular, PhoneRegular } from '@fluentui/react-icons';
import { baseUrl } from '../../services/api';
import { useOrganizationStore } from '../../stores/organization';

const Help = () => {
  const { currentOrganization } = useOrganizationStore();

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
        <div className="flex flex-col items-center">
          <div className="bg-white dark:bg-black mt-2 mb-4 rounded-2xl w-1/2 p-3">
            <h1 className="text-2xl font-bold mb-4">How can we help you?</h1>
            <p className="mb-4">
              If you have any questions or issues, please contact your system administrator for assistance. They can help you with troubleshooting common
              problems, providing access to resources, and guiding you through any technical difficulties you may encounter.
            </p>

            <p className="mb-4">
              For urgent issues, please ensure to provide detailed information about the problem, including any error messages or steps to reproduce the issue,
              to help expedite the resolution process.
            </p>

            <h2 className="text-xl font-semibold mb-2">Resources</h2>
            <p className="mb-4">Here are some resources that might help you:</p>
            <ul className="mb-4">
              <li>
                <Link href={baseUrl} target="_blank" rel="noopener noreferrer">
                  API Documentation <ArrowUpRightRegular fontSize={12} />
                </Link>
              </li>
              <li>
                <Link href="https://github.com/bpptkg/waveview" target="_blank" rel="noopener noreferrer">
                  GitHub <ArrowUpRightRegular fontSize={12} />
                </Link>
              </li>
              <li>
                <Link href="https://github.com/bpptkg/waveview/issues" target="_blank" rel="noopener noreferrer">
                  Report an Issue <ArrowUpRightRegular fontSize={12} />
                </Link>
              </li>
            </ul>

            <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
            <p>If you need further assistance, please reach out to our organization for support:</p>
            <ul className="mt-4">
              <li>
                <span className="font-semibold">{currentOrganization?.name}</span>
              </li>
              {currentOrganization?.description && (
                <li>
                  <p>{currentOrganization.description}</p>
                </li>
              )}
              {currentOrganization?.address && (
                <li>
                  <div className="inline-flex items-start gap-2">
                    <LocationRegular fontSize={16} />
                    <span>{currentOrganization.address}</span>
                  </div>
                </li>
              )}
              {currentOrganization?.email && (
                <li>
                  <div className="inline-flex items-center gap-2">
                    <MailRegular fontSize={16} />
                    <Link href={`mailto:${currentOrganization.email}`}>{currentOrganization.email}</Link>
                  </div>
                </li>
              )}
              {currentOrganization?.phone_number && (
                <li>
                  <div className="inline-flex items-center gap-2">
                    <PhoneRegular fontSize={16} />
                    <Link href={`tel:${currentOrganization.phone_number}`}>{currentOrganization.phone_number}</Link>
                  </div>
                </li>
              )}
              {currentOrganization?.mobile_number && (
                <li>
                  <div className="inline-flex items-center gap-2">
                    <PhoneRegular fontSize={16} />
                    <Link href={`tel:${currentOrganization.mobile_number}`}>{currentOrganization.mobile_number}</Link>
                  </div>
                </li>
              )}
              {currentOrganization?.fax_number && (
                <li>
                  <div className="inline-flex items-center gap-2">
                    <FaxRegular fontSize={16} />
                    <Link href={`tel:${currentOrganization.fax_number}`}>{currentOrganization.fax_number}</Link>
                  </div>
                </li>
              )}
              {currentOrganization?.url && (
                <li>
                  <div className="inline-flex items-center gap-2">
                    <GlobeRegular fontSize={16} />
                    <Link href={currentOrganization.url} target="_blank" rel="noopener noreferrer">
                      {currentOrganization.url}
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
