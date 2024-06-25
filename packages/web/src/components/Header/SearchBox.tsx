import { SearchBox as FluentSearchBox, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  searchBox: {
    width: '264px',
  },
});

const SearchBox = () => {
  const styles = useStyles();
  return <FluentSearchBox appearance="filled-lighter" placeholder="Search" className={styles.searchBox} />;
};

export default SearchBox;
