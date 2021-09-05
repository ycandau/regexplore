import { Box, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import RegexCard from './RegexCard';
import { Pagination } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    paddingInline: theme.spacing(8),
  },
  pagination: {
    paddingBlock: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default function Page({
  tsq,
  selectedTags,
  page,
  setPage,
  onExploreRegex,
  onSelectTag,
}) {
  const [pageInfo, setPageInfo] = useState({
    pageNum: page,
  });
  const { regexes, totalPages, pageNum } = pageInfo;

  useEffect(() => {
    const prevPageNum = pageNum;
    (async () => {
      try {
        let res;
        let baseBody = {
          tags: selectedTags.map(({ id }) => id),
          requestedPage: prevPageNum || 1,
        };
        if (!tsq) {
          res = await fetch('/regexes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...baseBody }),
          });
        } else {
          res = await fetch('/regexes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tsq, ...baseBody }),
          });
        }
        const { regexes, totalPages, pageNum } = await res.json();
        setPageInfo({ regexes, totalPages, pageNum });
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      setPage(pageNum || 1);
    };
  }, [tsq, selectedTags, setPageInfo, setPage, pageNum]);

  const classes = useStyles();

  const cards =
    !!regexes &&
    !!regexes.length &&
    regexes.map(({ id, user_name, title, notes, regex, tags }) => (
      <div className={classes.pagination} key={id}>
        <RegexCard
          {...{
            id,
            title,
            user_name,
            onExploreRegex,
            onSelectTag,
          }}
          literal={regex}
          tagsObj={tags}
          desc={notes}
        />
      </div>
    ));

  const pagination =
    !!regexes &&
    !!regexes.length &&
    ((key) =>
      regexes.length > 1 && (
        <div className={classes.pagination}>
          <Pagination
            key={key}
            shape="rounded"
            count={totalPages}
            page={pageNum}
            onChange={(e, page) =>
              setPageInfo({ regexes, totalPages, pageNum: page })
            }
          />
        </div>
      ));

  const pageContent = !!regexes &&
    !!regexes.length && [pagination('t'), ...cards, pagination('b')];

  return <Box className={classes.page}>{pageContent}</Box>;
}
