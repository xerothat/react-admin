import * as React from 'react';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { ListContext } from 'ra-core';

import SimpleList from './SimpleList';
import TextField from '../field/TextField';

const renderWithRouter = children => {
    const history = createMemoryHistory({ initialEntries: ['/posts'] });

    return {
        history,
        ...render(<Router history={history}>{children}</Router>),
    };
};

describe('<SimpleList />', () => {
    it('should render a list of items which provide a record context', async () => {
        const { getByText } = renderWithRouter(
            <ListContext.Provider
                value={{
                    loaded: true,
                    loading: false,
                    ids: [1, 2],
                    data: {
                        1: { id: 1, title: 'foo' },
                        2: { id: 2, title: 'bar' },
                    },
                    total: 2,
                    resource: 'posts',
                    basePath: '/posts',
                }}
            >
                <SimpleList
                    primaryText={record => record.id.toString()}
                    secondaryText={<TextField source="title" />}
                />
            </ListContext.Provider>
        );

        await waitFor(() => {
            expect(
                within(getByText('1').closest('li')).queryByText('foo')
            ).not.toBeNull();
            expect(
                within(getByText('2').closest('li')).queryByText('bar')
            ).not.toBeNull();
        });
    });

    it.each([
        ['edit', '/posts/1', 'edit'],
        ['boolean', '/posts/1', true],
        ['show', '/posts/1/show', 'show'],
        [
            'function',
            '/posts/1/details',
            (record, id, basePath) => `${basePath}/${id}/details`,
        ],
    ])('should support %s linkType', async (_, expectedUrl, linkType) => {
        const { history, getByText } = renderWithRouter(
            <ListContext.Provider
                value={{
                    loaded: true,
                    loading: false,
                    ids: [1, 2],
                    data: {
                        1: { id: 1, title: 'foo' },
                        2: { id: 2, title: 'bar' },
                    },
                    total: 2,
                    resource: 'posts',
                    basePath: '/posts',
                }}
            >
                <SimpleList
                    linkType={linkType}
                    primaryText={record => record.id.toString()}
                    secondaryText={<TextField source="title" />}
                />
            </ListContext.Provider>
        );

        fireEvent.click(getByText('1'));
        await waitFor(() => {
            expect(history.entries[history.length - 1].pathname).toEqual(
                expectedUrl
            );
        });
    });
    it('should not render a link if linkType is false', async () => {
        const { getByText } = renderWithRouter(
            <ListContext.Provider
                value={{
                    loaded: true,
                    loading: false,
                    ids: [1, 2],
                    data: {
                        1: { id: 1, title: 'foo' },
                        2: { id: 2, title: 'bar' },
                    },
                    total: 2,
                    resource: 'posts',
                    basePath: '/posts',
                }}
            >
                <SimpleList
                    linkType={false}
                    primaryText={record => record.id.toString()}
                    secondaryText={<TextField source="title" />}
                />
            </ListContext.Provider>
        );

        await waitFor(() => {
            expect(getByText('1').closest('a')).toBeNull();
        });
    });
});
