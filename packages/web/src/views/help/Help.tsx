import { ArrowUpRightRegular, GlobeRegular, LocationRegular, MailRegular } from '@fluentui/react-icons';
import { baseUrl } from '../../services/api';
import { useOrganizationStore } from '../../stores/organization';

const Help = () => {
  const { currentOrganization } = useOrganizationStore();

  return (
    <div className="flex flex-col items-center max-w-1/2 mx-auto bg-white dark:bg-black mt-2 rounded-lg">
      <div className="p-3 max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-4">How can we help you?</h1>
        <p className="mb-4">
          If you have any questions or issues, please contact your system administrator for assistance. They can help you with troubleshooting common problems,
          providing access to resources, and guiding you through any technical difficulties you may encounter.
        </p>

        <p className="mb-4">
          For urgent issues, please ensure to provide detailed information about the problem, including any error messages or steps to reproduce the issue, to
          help expedite the resolution process.
        </p>

        <h2 className="text-xl font-semibold mb-2">Resources</h2>
        <p className="mb-4">Here are some resources that might help you:</p>
        <ul className="mb-4">
          <li>
            <a href={baseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
              API Documentation
              <ArrowUpRightRegular fontSize={12} />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/bpptkg/waveview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              GitHub
              <ArrowUpRightRegular fontSize={12} />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/bpptkg/waveview/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              Report an Issue
              <ArrowUpRightRegular fontSize={12} />
            </a>
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
              <div className="inline-flex gap-2">
                <LocationRegular fontSize={16} />
                <span>{currentOrganization.address}</span>
              </div>
            </li>
          )}
          {currentOrganization?.email && (
            <li>
              <div className="inline-flex gap-2">
                <MailRegular fontSize={16} />
                <a href={`mailto:${currentOrganization.email}`} className="text-blue-500 hover:underline">
                  {currentOrganization.email}
                </a>
              </div>
            </li>
          )}
          {currentOrganization?.url && (
            <li>
              <div className="inline-flex gap-2">
                <GlobeRegular fontSize={16} />
                <a href={currentOrganization.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {currentOrganization.url}
                </a>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Help;
