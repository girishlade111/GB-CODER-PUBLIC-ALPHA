      import { Fragment, forwardRef, useMemo } from 'react';
      import { parseMarkdown, INLINE_RULES } from '../lib/markdown.js';

      /**
       * Renders parsed markdown as React elements.
       *
       * The deliberate absence of `dangerouslySetInnerHTML` is the whole point. Inline
       * formatting is compiled into an array of React nodes, so a post containing
       * `<script>alert(1)</script>` renders as visible text instead of executing.
       *
       * The inline pass reuses the same rule order as `lib/markdown.js`, which is what
       * keeps `` **`code`** `` and `[a *b* c](href)` behaving predictably. React's own
       * escaping then handles every text fragment for us.
       */

      const INLINE_PATTERN = new RegExp(INLINE_RULES.map((rule) => rule.pattern.source).join('|'), 'g');

      const isSafeHref = (href) => /^(https?:|mailto:|#|\/)/i.test(href);

      /**
       * Splits one line of markdown into React nodes.
       *
       * Returns an array because a single line can produce several nodes: `a *b* c`
       * becomes ['a ', <em>b</em>, ' c'].
       */
      function renderInline(text, keyPrefix) {
        const source = String(text);
        const nodes = [];
        let lastIndex = 0;
        let match;
        let key = 0;

        // `pattern` from each rule carries its own capture-group layout, so the branch
        // below identifies which rule matched rather than assuming group positions.
        INLINE_PATTERN.lastIndex = 0;

        while ((match = INLINE_PATTERN.exec(source)) !== null) {
          if (match.index > lastIndex) {
            nodes.push(source.slice(lastIndex, match.index));
          }

          const token = match[0];
          const nodeKey = keyPrefix + '-' + key++;

          if (token.charAt(0) === '`') {
            nodes.push(
              <code key={nodeKey} className="prose__code-inline">
                {token.slice(1, -1)}
              </code>,
            );
          } else if (token.slice(0, 2) === '**') {
            nodes.push(<strong key={nodeKey}>{token.slice(2, -2)}</strong>);
          } else if (token.charAt(0) === '*') {
            nodes.push(<em key={nodeKey}>{token.slice(1, -1)}</em>);
          } else if (token.charAt(0) === '[') {
            const split = token.indexOf('](');
            const label = token.slice(1, split);
            const href = token.slice(split + 2, -1);

            nodes.push(
              isSafeHref(href) ? (
                <a key={nodeKey} href={href} rel="noopener noreferrer">
                  {label}
                </a>
              ) : (
                // An unsafe scheme degrades to plain text rather than becoming a link.
                <span key={nodeKey}>{label}</span>
              ),
            );
          } else {
            nodes.push(token);
          }

          lastIndex = match.index + token.length;
        }

        if (lastIndex < source.length) nodes.push(source.slice(lastIndex));
        return nodes;
      }

      const AnchorGlyph = () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
          strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M9 15 15 9M10.5 6.5 13 4a3.5 3.5 0 0 1 5 5l-2.5 2.5M13.5 17.5 11 20a3.5 3.5 0 0 1-5-5l2.5-2.5" />
        </svg>
      );

      /**
       * `forwardRef` is required because the table of contents scroll-spy observes the
       * rendered heading elements, which means the parent needs the real DOM nodes.
       */
      const MDXBlock = forwardRef(function MDXBlock({ source }, ref) {
        const blocks = useMemo(() => parseMarkdown(source), [source]);

        return (
          <div className="prose" ref={ref}>
            {blocks.map((block, index) => {
              const key = block.kind + '-' + index;
              const level = block.level;

              switch (block.kind) {
                case 'heading': {
                  const Tag = 'h' + level;
                  return (
                    <Tag key={key} id={block.id} className={'prose__h prose__h--' + level} data-heading={block.id}>
                      <a className="prose__anchor" href={'#' + block.id}>
                        <AnchorGlyph />
                        <span className="sr-only">Link to this section: {block.text}</span>
                      </a>
                      {renderInline(block.text, key)}
                    </Tag>
                  );
                }

                case 'paragraph':
                  return (
                    <p key={key} className="prose__p">
                      {renderInline(block.text, key)}
                    </p>
                  );

                case 'quote':
                  return (
                    <blockquote key={key} className="prose__quote">
                      <p>{renderInline(block.text, key)}</p>
                    </blockquote>
                  );

                case 'code':
                  return (
                    <figure key={key} className="prose__code">
                      <figcaption className="prose__code-lang">{block.language}</figcaption>
                      <pre>
                        <code>{block.code}</code>
                      </pre>
                    </figure>
                  );

                case 'list': {
                  const ListTag = block.ordered ? 'ol' : 'ul';
                  return (
                    <ListTag
                      key={key}
                      className={'prose__list prose__list--' + (block.ordered ? 'ordered' : 'bullet')}
                    >
                      {block.items.map((item, itemIndex) => (
                        <li key={key + '-li-' + itemIndex}>{renderInline(item, key + '-li-' + itemIndex)}</li>
                      ))}
                    </ListTag>
                  );
                }

                case 'table':
                  return (
                    <div key={key} className="prose__table-wrap">
                      <table className="prose__table">
                        <caption className="sr-only">Data table from the post</caption>
                        <thead>
                          <tr>
                            {block.header.map((cell, cellIndex) => (
                              <th key={'th-' + cellIndex} scope="col">
                                {renderInline(cell, key + '-th-' + cellIndex)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row, rowIndex) => (
                            <tr key={'tr-' + rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={'td-' + cellIndex}>{renderInline(cell, key + '-' + rowIndex + '-' + cellIndex)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        );
      });

      export default MDXBlock;