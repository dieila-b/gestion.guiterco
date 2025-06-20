
import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { ArticleWithMargin } from '@/types/margins';
import ArticleMarginTableActions from './ArticleMarginTableActions';
import ArticleMarginTableHeader from './ArticleMarginTableHeader';
import ArticleMarginTableRow from './ArticleMarginTableRow';
import ArticleMarginTableFooter from './ArticleMarginTableFooter';

interface ArticleMarginTableProps {
  articles: ArticleWithMargin[];
  isLoading: boolean;
}

const ArticleMarginTable = ({ articles, isLoading }: ArticleMarginTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Chargement des marges...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ArticleMarginTableActions isLoading={isLoading} />

      <div className="rounded-md border">
        <Table>
          <ArticleMarginTableHeader />
          <TableBody>
            {articles?.length > 0 ? (
              articles.map((article) => (
                <ArticleMarginTableRow key={article.id} article={article} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="text-muted-foreground">
                    Aucun article avec marge trouvé
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <ArticleMarginTableFooter />
      </div>
    </div>
  );
};

export default ArticleMarginTable;
