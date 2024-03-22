import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Fuse from 'fuse.js';
import Select from 'react-select';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Switch, Drawer } from '@mui/material';
import { useTable, usePagination } from 'react-table';
import { MdCancel } from "react-icons/md";
import { LuArrowUpDown } from "react-icons/lu";
import GroupingColumn from "./GroupingColumn"
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

function AdvancedDataTable() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [columnsVisibility, setColumnsVisibility] = useState({});
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [showSidePanelSort, setShowSidePanelSort] = useState(false);
    const [showSidePanelGrp, setShowSidePanelGrp] = useState(false);
    const [showSidePanelFilter, setShowSidePanelFilter] = useState(false);
    const [temporaryColumnVisibility, setTemporaryColumnVisibility] = useState({});
    const [sortColumns, setSortColumns] = useState([]);
    const [sortBy, setSortBy] = useState(null);
    const [selectedGrouping, setSelectedGrouping] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startUpdatedDate, setStartUpdatedDate] = useState('');
    const [endUpdatedDate, setEndUpdatedDate] = useState('');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(200);
    const [priceRange, setPriceRange] = useState([0, 200]);
    const [minSalePrice, setMinSalePrice] = useState(0);
    const [maxSalePrice, setMaxSalePrice] = useState(175);
    const [salePriceRange, setSalePriceRange] = useState([0, 175]);
    const [fuse, setFuse] = useState(null);
    const [searchFuseQuery, setSearchFuseQuery] = useState('');
    const [salePriceRangeApplied, setSalePriceRangeApplied] = useState(false);



    const getUniqueCategories = () => {
        const categoriesSet = new Set();
        data.forEach(item => {
            categoriesSet.add(item.category);
        });
        return Array.from(categoriesSet);
    };
    const getUniqueSubcategories = () => {
        const subcategoriesSet = new Set();
        data.forEach(item => {
            subcategoriesSet.add(item.subcategory);
        });
        return Array.from(subcategoriesSet);
    };



    const columns = React.useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
            },
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Category',
                accessor: 'category',
            },
            {
                Header: 'Sub Category',
                accessor: 'subcategory',
            },
            {
                Header: 'Created At',
                accessor: 'createdAt',
            },
            {
                Header: 'Updated At',
                accessor: 'updatedAt',
            },
            {
                Header: 'Price',
                accessor: 'price',
            },
            {
                Header: 'Sale Price',
                accessor: 'sale_price',
            },
        ],
        []
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get('https://file.notion.so/f/f/ca71608c-1cc3-4167-857a-24da97c78717/b041832a-ec40-47bb-b112-db9eeb72f678/sample-data.json?id=ce885cf5-d90e-46f3-ab62-c3609475cfb6&table=block&spaceId=ca71608c-1cc3-4167-857a-24da97c78717&expirationTimestamp=1711173600000&signature=M74t9Sf9nx-jaP5e7YBbqgtYMRMIICvyOxaxQdI63Ls&downloadName=sample-data.json');
                const formattedData = result.data.map(item => ({
                    ...item,
                    createdAt: formatDate(item.createdAt),
                    updatedAt: formatDate(item.updatedAt),
                }));
                const initialColumnsVisibility = {};
                columns.forEach(column => {
                    initialColumnsVisibility[column.accessor] = true;
                });
                setColumnsVisibility(initialColumnsVisibility);
                setTemporaryColumnVisibility(initialColumnsVisibility);
                setData(formattedData);
                setFilteredData(formattedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        const forceRefresh = () => {
            window.location.reload(true);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const filtered = data.filter(item => {
            const searchQueryLower = searchQuery.toLowerCase();
            return Object.values(item).some(value => {
                if (typeof value === 'string' || typeof value === 'number') {
                    return value.toString().toLowerCase().includes(searchQueryLower);
                }
                return false;
            });
        });
        setFilteredData(filtered);
    }, [searchQuery, data]);

    useEffect(() => {
        const filtered = data.filter(item => {

            const isPriceInRange = item.price >= minPrice && item.price <= maxPrice;
            const isSalePriceInRange =
                (item.sale_price !== null && item.sale_price !== undefined) &&
                item.sale_price >= minSalePrice && item.sale_price <= maxSalePrice;

            return isPriceInRange && isSalePriceInRange;
        });
        setFilteredData(filtered);
    }, [data, minPrice, maxPrice, minSalePrice, maxSalePrice]);


    useEffect(() => {
        const filtered = data.filter(item => {
            if (!fuse) return true;
            if (!searchFuseQuery) return true;

            const results = fuse.search(searchFuseQuery);
            return results.some(result => result.item === item);
        });
        setFilteredData(filtered);
    }, [data, fuse, searchFuseQuery]);


    const filterData = () => {
        let filtered = data.filter(item => {

            if (searchFuseQuery && !fuse) return false;
            if (searchFuseQuery) {
                const results = fuse.search(searchFuseQuery);
                if (!results.some(result => result.item === item)) {
                    return false;
                }
            }

            if (selectedCategories.length > 0 && !selectedCategories.some(option => option.value === item.category)) {
                return false;
            }

            if (selectedSubcategories.length > 0 && !selectedSubcategories.some(option => option.value === item.subcategory)) {
                return false;
            }


            const itemCreatedAt = new Date(item.createdAt);
            if ((startDate && itemCreatedAt < new Date(startDate)) || (endDate && itemCreatedAt > new Date(endDate))) {
                return false;
            }

            const itemUpdatedAt = new Date(item.updatedAt);
            if ((startUpdatedDate && itemUpdatedAt < new Date(startUpdatedDate)) || (endUpdatedDate && itemUpdatedAt > new Date(endUpdatedDate))) {
                return false;
            }

            if (item.price < minPrice || item.price > maxPrice) {
                return false;
            }

            if ((item.sale_price !== null && item.sale_price !== undefined) && (item.sale_price < minSalePrice || item.sale_price > maxSalePrice)) {
                return false;
            }

            return true;
        });

        setFilteredData(filtered);
    };




    const handleApplyFilter = () => {
        let filtered = data.filter(item => {

            if (selectedCategories.length > 0 && !selectedCategories.some(option => option.value === item.category)) {
                return false;
            }
            if (selectedSubcategories.length > 0 && !selectedSubcategories.some(option => option.value === item.subcategory)) {
                return false;
            }
            const itemCreatedAt = new Date(item.createdAt);
            if ((startDate && itemCreatedAt < new Date(startDate)) || (endDate && itemCreatedAt > new Date(endDate))) {
                return false;
            }
            const itemUpdatedAt = new Date(item.updatedAt);
            if ((startUpdatedDate && itemUpdatedAt < new Date(startUpdatedDate)) || (endUpdatedDate && itemUpdatedAt > new Date(endUpdatedDate))) {
                return false;
            }

            if (item.price < minPrice || item.price > maxPrice) {
                return false;
            }

            if ((item.sale_price !== null && item.sale_price !== undefined) && (item.sale_price < minSalePrice || item.sale_price > maxSalePrice)) {
                return false;
            }

            return true;
        });
        const filteredByPrice = filteredData.filter(item => item.price >= minPrice && item.price <= maxPrice);

        setFilteredData(filtered);
        setFilteredData(filteredByPrice);
        setShowSidePanelFilter(false)
    };


    useEffect(() => {
        filterData();
    }, [searchFuseQuery, selectedCategories, selectedSubcategories, startDate, endDate, startUpdatedDate, endUpdatedDate, minPrice, maxPrice, minSalePrice, maxSalePrice, priceRange, salePriceRange]);


    useEffect(() => {
        filterDataByDate();
    }, [startDate, endDate]);

    useEffect(() => {
        filterUpdatedDataByDate();
    }, [startUpdatedDate, endUpdatedDate]);

    useEffect(() => {
        filterDataByPrice();
    }, [priceRange]);

    useEffect(() => {
        filterDataBySalePrice();
    }, [minSalePrice, maxSalePrice, salePriceRange]);


    useEffect(() => {
        const options = {
            keys: ['name'],
            includeScore: true,

        };
        setFuse(new Fuse(data, options));
    }, [data]);


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: '2-digit' };
        return date.toLocaleDateString('en-US', options).replace(/,/g, '-');
    };

    const handleToggleColumn = (columnAccessor) => {
        setTemporaryColumnVisibility(prevVisibility => ({
            ...prevVisibility,
            [columnAccessor]: !prevVisibility[columnAccessor]
        }));
    };

    // hide / show
    const handleApplyChanges = () => {
        setColumnsVisibility(temporaryColumnVisibility);
        setShowSidePanel(false);

        setShowSidePanelFilter(false);
    };

    const handleShowAllColumns = () => {
        const allColumnsVisible = {};
        columns.forEach(column => {
            allColumnsVisible[column.accessor] = true;
        });
        setTemporaryColumnVisibility(allColumnsVisible);
    };
    // sorted
    const handleSort = (columnAccessor) => {
        const isSorted = sortColumns.includes(columnAccessor);

        const newSortColumns = isSorted
            ? sortColumns.filter(col => col !== columnAccessor)
            : [...sortColumns, columnAccessor];
        setSortColumns(newSortColumns);
        setSortBy(isSorted ? null : columnAccessor);
    };

    const handleApplySort = () => {

        let sortedData = [...filteredData];
        sortColumns.forEach(columnAccessor => {
            sortedData = sortedData.sort((a, b) => {
                if (typeof a[columnAccessor] === 'string' && typeof b[columnAccessor] === 'string') {
                    return a[columnAccessor].localeCompare(b[columnAccessor]);
                }
                return a[columnAccessor] - b[columnAccessor];
            });
        });

        setFilteredData(sortedData);
        setShowSidePanelSort(false);
    };

    const handleClearSort = () => {
        setSortColumns([]);
        setFilteredData(data);
        setShowSidePanelSort(false);
    };

    // group column
    const handleClearGrp = () => {
        setFilteredData(data);
        setSelectedGrouping("")
        setShowSidePanelGrp(false);

    };

    // filter
    const handleNameSearch = (event) => {
        const { value } = event.target;
        setSearchFuseQuery(value);

        if (!fuse) return;

        if (value === '') {
            setFilteredData(data);
        } else {
            const results = fuse.search(value);
            const filtered = results.map(result => result.item);
            setFilteredData(filtered);
        }
    };

    const handleCategoryFilter = (selectedOptions) => {
        setSelectedCategories(selectedOptions);

        if (selectedOptions.length === 0) {
            setFilteredData(data);
            return;
        }

        const filtered = filteredData.filter(item => selectedOptions.some(option => option.value === item.category));
        setFilteredData(filtered);
    };

    const handleSubcategoryFilter = (selectedOptions) => {
        setSelectedSubcategories(selectedOptions);

        if (selectedOptions.length === 0) {
            setFilteredData(data);
            return;
        }

        const filtered = filteredData.filter(item => selectedOptions.some(option => option.value === item.subcategory));
        setFilteredData(filtered);
    };

    const handleDateChange = (e, isStartDate) => {
        const selectedDate = e.target.value;

        if (isStartDate) {
            setStartDate(selectedDate);
        } else {
            setEndDate(selectedDate);
        }
    };

    const filterDataByDate = () => {
        const filtered = filteredData.filter(item => {
            const itemDate = new Date(item.createdAt);
            return (!startDate || itemDate >= new Date(startDate)) && (!endDate || itemDate <= new Date(endDate));
        });
        setFilteredData(filtered);
    };

    const handleUpdatedDateChange = (e, isStartUpdatedDate) => {
        const selectedUpdatedDate = e.target.value;

        if (isStartUpdatedDate) {
            setStartUpdatedDate(selectedUpdatedDate);
        } else {
            setEndUpdatedDate(selectedUpdatedDate);
        }
    };

    const filterUpdatedDataByDate = () => {
        const filtered = filteredData.filter(item => {
            const itemUpdatedDate = new Date(item.updatedAt);
            return (!startUpdatedDate || itemUpdatedDate >= new Date(startUpdatedDate)) && (!endUpdatedDate || itemUpdatedDate <= new Date(endUpdatedDate));
        });
        setFilteredData(filtered);
    };

    const filterDataByPrice = () => {
        const filtered = data.filter(item => {

            return item.price >= priceRange[0] && item.price <= priceRange[1];
        });
        setFilteredData(filtered);
    };

    const handlePriceChange = (value) => {
        setPriceRange(value);
        filterDataByPrice()
    };

    const handleClearFilter = () => {
        setFilteredData(data);
        setMinSalePrice(0);
        setMaxSalePrice(175);
        setSalePriceRange([0, 175]);
        setSearchFuseQuery('');
        setSelectedCategories([]);
        setSelectedSubcategories([]);
        setStartDate('');
        setEndDate('');
        setStartUpdatedDate('');
        setEndUpdatedDate('');
        setMinPrice(0);
        setMaxPrice(200);
        setPriceRange([0, 200]);
        setSalePriceRangeApplied(false);
        setShowSidePanelFilter(false);
    };

    const filterDataBySalePrice = () => {
        const filtered = data.filter(item => {

            if (salePriceRange[0] !== 0 || salePriceRange[1] !== 175) {

                if (item.sale_price !== null && item.sale_price !== undefined) {
                    return item.sale_price >= minSalePrice && item.sale_price <= maxSalePrice;
                }

                return false;
            }

            return true;
        });
        setFilteredData(filtered);
    };

    const handleSalePriceChange = (value) => {
        setSalePriceRange(value);
        setMinSalePrice(value[0]);
        setMaxSalePrice(value[1]);
        setSalePriceRangeApplied(true);
        filterDataBySalePrice();
    };

    useEffect(() => {
        filterDataBySalePrice();
    }, [minSalePrice, maxSalePrice, salePriceRange, salePriceRangeApplied]);

    useEffect(() => {
        filterDataBySalePrice();
    }, []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        state: { pageIndex },
    } = useTable(
        {
            columns,
            data: React.useMemo(() => filteredData, [filteredData]),
            initialState: { pageIndex: 0 },
        },
        usePagination
    );
    return (
        <div>
            <Navbar setShowSidePanel={setShowSidePanel} setSearchQuery={setSearchQuery} setShowSidePanelSort={setShowSidePanelSort} setShowSidePanelGrp={setShowSidePanelGrp} setShowSidePanelFilter={setShowSidePanelFilter} />
            {/* hide/show */}
            <Drawer anchor="right" open={showSidePanel} onClose={() => setShowSidePanel(false)}>
                <div className='side-panel'>
                    <div className='d-flex '>
                        <h3 className='mx-5'>Show/Hide Columns</h3>
                        <MdCancel onClick={() => setShowSidePanel(false)} />
                    </div>
                    {columns.map(column => (
                        <div key={column.accessor} className='d-flex justify-content-between mb-3 p-2  side-panel-content rounded'>
                            <span>{column.Header}</span>
                            <Switch
                                checked={temporaryColumnVisibility[column.accessor]}
                                onChange={() => handleToggleColumn(column.accessor)}
                            />
                        </div>
                    ))}
                    <div className='side-panel-button gap-3 mt-3'>
                        <Button className='border border-dark' onClick={handleShowAllColumns}>Show All Columns</Button>
                        <Button className='bg-primary text-light' onClick={handleApplyChanges}>Apply</Button>
                    </div>
                </div>
            </Drawer>
            {/* sort */}
            <Drawer anchor="right" open={showSidePanelSort} onClose={() => setShowSidePanelSort(false)}>
                <div className='side-panel'>
                    <div className='d-flex '>
                        <h3 className='mx-5'>Sort Columns</h3>
                        <MdCancel onClick={() => setShowSidePanelSort(false)} />
                    </div>
                    {columns.map(column => (
                        <div key={column.accessor} className={`d-flex justify-content-between mb-3 p-2  side-panel-content rounded ${sortColumns.includes(column.accessor) ? 'sorted-column' : ''}`} onClick={() => handleSort(column.accessor)}>
                            <span>{column.Header}</span>
                            <LuArrowUpDown />
                        </div>
                    ))}
                    <div className='side-panel-button gap-3 mt-3'>
                        <Button className='bg-primary text-light' onClick={handleApplySort}>Apply</Button>
                        <Button className='border border-dark' onClick={handleClearSort}>Clear Sort</Button>
                    </div>
                </div>
            </Drawer>
            {/* group column */}
            <Drawer anchor="right" open={showSidePanelGrp} onClose={() => setShowSidePanelGrp(false)}>
                <div className='side-panel'>
                    <div className='d-flex '>
                        <h3 className='mx-5'>Create Groups</h3>
                        <MdCancel onClick={() => setShowSidePanelGrp(false)} />
                    </div>
                    <select className='w-100 p-2' value={selectedGrouping} onChange={(e) => { setSelectedGrouping(e.target.value); setShowSidePanelGrp(false) }}>
                        <option value="" disabled>-- Select --</option>
                        <option value="category" >Category</option>
                        <option value="subcategory">Subcategory</option>
                    </select>
                    <div className='side-panel-button gap-3 mt-3'>
                        <Button className='border border-dark' onClick={handleClearGrp}>Clear Grouping</Button>
                    </div>
                </div>
            </Drawer>
            {/* filter */}
            <Drawer anchor="right" open={showSidePanelFilter} onClose={() => setShowSidePanelFilter(false)}>
                <div className='side-panel'>
                    <div className='d-flex justify-content-between'>
                        <h3 className='mx-5'>Filter</h3>
                        <MdCancel onClick={() => setShowSidePanelFilter(false)} />
                    </div>
                    <div>
                        <div className='p-2'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h4>Name</h4>

                            </div>
                            <input
                                placeholder='Enter Name'
                                className='p-2'
                                value={searchFuseQuery}
                                onChange={handleNameSearch}
                            />

                        </div>
                        <div className='p-2'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h4>Category</h4>

                            </div>
                            <Select
                                className='w-100 p-2'
                                options={getUniqueCategories().map(category => ({ value: category, label: category }))}
                                isMulti
                                value={selectedCategories}
                                onChange={handleCategoryFilter}
                            />


                        </div>
                        <div className='p-2'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h4>Subcategory</h4>

                            </div>
                            <Select
                                className='w-100 p-2'
                                options={getUniqueSubcategories().map(subcategory => ({ value: subcategory, label: subcategory }))}
                                isMulti
                                value={selectedSubcategories}
                                onChange={handleSubcategoryFilter}
                            />
                        </div>
                        <div className='p-2'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h4>Created At</h4>

                            </div>
                            <div className='d-flex justify-content-between text-center fs-6 align-items-center'>
                                <p>From : </p>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleDateChange(e, true)}
                                />
                            </div>
                            <div className='d-flex justify-content-between text-center fs-6 align-items-center'>
                                <p>To : </p>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => handleDateChange(e, false)}
                                />
                            </div>
                        </div>
                        <div className='p-2'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h4>Updated At</h4>

                            </div>
                            <div className='d-flex justify-content-between text-center fs-6 align-items-center'>
                                <p>From :</p>
                                <input
                                    type="date"
                                    value={startUpdatedDate}
                                    onChange={(e) => handleUpdatedDateChange(e, true)}
                                />
                            </div>
                            <div className='d-flex justify-content-between text-center fs-6 align-items-center'>
                                <p>To : </p>
                                <input
                                    type="date"
                                    value={endUpdatedDate}
                                    onChange={(e) => handleUpdatedDateChange(e, false)}
                                />
                            </div>
                        </div>
                        <div className='p-2'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h4>Price</h4>

                            </div>

                            <Slider
                                range
                                min={0}
                                max={200}
                                value={priceRange}
                                onChange={handlePriceChange}
                            />
                            <div className="d-flex justify-content-between">
                                <p>{priceRange[0]}</p>
                                <p>{priceRange[1]}</p>
                            </div>

                        </div>
                        <div className='p-2'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h4>Sale Price</h4>

                            </div>

                            <Slider
                                range
                                min={0}
                                max={175}
                                value={salePriceRange}
                                onChange={handleSalePriceChange}
                            />
                            <div className="d-flex justify-content-between">
                                <p>{salePriceRange[0]}</p>
                                <p>{salePriceRange[1]}</p>
                            </div>

                        </div>

                    </div>

                    <div className='side-panel-button gap-3 mt-3'>
                        <Button className='border border-dark' onClick={handleClearFilter}>Clear Filters</Button>
                        <Button className='bg-primary text-light' onClick={handleApplyFilter}>Apply Filter</Button>
                    </div>
                </div>
            </Drawer >
            {/* table */}
            {
                selectedGrouping === "" ?
                    <>
                        <TableContainer component={Paper}>
                            <Table {...getTableProps()}>
                                <TableHead className='table-th'>
                                    <TableRow>
                                        {headerGroups.map(headerGroup => (
                                            headerGroup.headers.map(column => (
                                                columnsVisibility[column.id] && (
                                                    <TableCell {...column.getHeaderProps()}>
                                                        {column.render('Header')}
                                                    </TableCell>
                                                )
                                            ))
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {page.map(row => {
                                        prepareRow(row);
                                        return (
                                            <TableRow {...row.getRowProps()}>
                                                {row.cells.map(cell => (
                                                    columnsVisibility[cell.column.id] && (
                                                        <TableCell {...cell.getCellProps()}>
                                                            {cell.render('Cell')}
                                                        </TableCell>
                                                    )
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
                        )}</>
                    : <GroupingColumn datas={filteredData} columnsVisibility={columnsVisibility} selectedGrouping={selectedGrouping} showSidePanelGrp={showSidePanelGrp} />
            }

        </div >
    );
}

export default AdvancedDataTable;
