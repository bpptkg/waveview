import { Button, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@fluentui/react-components';
import { Filter20Regular, MoreHorizontal20Regular, Search20Regular } from '@fluentui/react-icons';

const EventTable = () => {
  return (
    <div className="p-2">
      <div className="flex items-center justify-end">
        <Button icon={<Filter20Regular />} appearance="transparent" />
        <Button icon={<Search20Regular />} appearance="transparent" />
        <Button icon={<MoreHorizontal20Regular />} appearance="transparent" />
      </div>
      <Table aria-label="Event Table">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Time</TableHeaderCell>
            <TableHeaderCell>Duration (s)</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Magnitude</TableHeaderCell>
            <TableHeaderCell>Author</TableHeaderCell>
            <TableHeaderCell>
              <Button icon={<MoreHorizontal20Regular />} appearance="transparent" />
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>2021-01-01 00:00:00</TableCell>
            <TableCell>10</TableCell>
            <TableCell>Earthquake</TableCell>
            <TableCell>3.2</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>
              <Button icon={<MoreHorizontal20Regular />} appearance="transparent" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default EventTable;
