import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useTable, usePagination } from 'react-table';

function GroupingColumn({ datas, columnsVisibility, selectedGrouping }) {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [highlightedRow, setHighlightedRow] = useState(null);
    const [pageIndex1, setPageIndex1] = useState(0);

    useEffect(() => {
        if (selectedCategory) {
            setFilteredData(datas.filter(data => data[selectedGrouping] === selectedCategory));
        } else {
            setFilteredData(datas);
        }
    }, [datas, selectedCategory, selectedGrouping]);

    const categoryCounts = datas.reduce((acc, data) => {
        const category = data[selectedGrouping];
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});


    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };


    const columns = React.useMemo(() => {
        return Object.keys(filteredData[0] || {}).filter(key => key !== selectedGrouping).map(key => ({
            Header: key,
            accessor: key,
        }));
    }, [filteredData, selectedGrouping]);


    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        pageCount,
        gotoPage,
        canPreviousPage,
        canNextPage,
        nextPage,
        previousPage,
        state: { pageIndex },
    } = useTable(
        {
            columns,
            data: filteredData,
            initialState: { pageIndex: 0 },
        },
        usePagination
    );

    useEffect(() => {
        if (datas.length > 0) {
            setSelectedCategory(datas[0][selectedGrouping]);
            setHighlightedRow(datas[0][selectedGrouping]);
        }
    }, [datas, selectedGrouping]);

    const handleRowHighlight = (category) => {
        setHighlightedRow(category);
    };

    const handleTable1PageChange = (newPageIndex) => {
        setPageIndex1(newPageIndex);
        gotoPage(newPageIndex);
    };

    return (
        <>
            <div className='container d-flex flex-row gap-3 justify-content-center' >
                <div>
                    <TableContainer component={Paper} style={{ width: '100%', boxShadow: 'none' }}>
                        <Table >
                            <TableHead className='table-th'>
                                <TableRow>
                                    <TableCell>{selectedGrouping}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(categoryCounts).map(([category, count], index) => (
                                    index >= pageIndex1 * 10 && index < (pageIndex1 + 1) * 10 && (
                                        <TableRow
                                            key={category}
                                            onClick={() => {
                                                handleCategoryChange(category);
                                                handleRowHighlight(category);
                                            }}
                                            style={{ cursor: 'pointer', backgroundColor: highlightedRow === category ? 'gray' : 'inherit' }}
                                        >
                                            <TableCell>{category} ({count})</TableCell>
                                        </TableRow>
                                    )
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {Object.keys(categoryCounts).length > 10 && (
                        <div className='buttons'>
                            <button className='arrow-btn' onClick={() => handleTable1PageChange(pageIndex1 - 1)} disabled={pageIndex1 === 0}>
                                {'<'}
                            </button>
                            {[...Array(Math.ceil(Object.keys(categoryCounts).length / 10)).keys()].map(i => (
                                <button key={i} onClick={() => handleTable1PageChange(i)} disabled={pageIndex1 === i} className={pageIndex1 === i ? 'inner-btn' : 'inactive-btn'}>
                                    {i + 1}
                                </button>
                            ))}
                            <button className='arrow-btn' onClick={() => handleTable1PageChange(pageIndex1 + 1)} disabled={pageIndex1 === Math.ceil(Object.keys(categoryCounts).length / 10) - 1}>
                                {'>'}
                            </button>
                        </div>
                    )}
                </div>
                <div className='w-100'>
                    <TableContainer component={Paper} style={{ boxShadow: "none", width: "100%" }}>
                        <Table {...getTableProps()}>
                            <TableHead className='table-th'>
                                <TableRow>
                                    {headerGroups.map(headerGroup => (
                                        headerGroup.headers.map(column => (
                                            <TableCell {...column.getHeaderProps()}>
                                                {column.render('Header')}
                                            </TableCell>
                                        ))
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody {...getTableBodyProps()}>
                                {page.map(row => {
                                    prepareRow(row);
                                    return (
                                        <TableRow {...row.getRowProps()}>
                                            {row.cells.map(cell => (
                                                <TableCell {...cell.getCellProps()}>
                                                    {cell.render('Cell')}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredData.length > 10 && (
                        <div className='buttons'>
                            <button className='arrow-btn' onClick={() => previousPage()} disabled={!canPreviousPage}>
                                {'<'}
                            </button>
                            {[...Array(pageCount).keys()].map(i => (
                                <button key={i} onClick={() => gotoPage(i)} disabled={pageIndex === i} className={pageIndex === i ? 'inner-btn' : 'inactive-btn'}>
                                    {i + 1}
                                </button>
                            ))}
                            <button className='arrow-btn' onClick={() => nextPage()} disabled={!canNextPage}>
                                {'>'}
                            </button>
                        </div>
                    )}
                </div>

            </div >
        </>
    );
}

export default GroupingColumn;
