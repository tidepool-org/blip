/*jslint node: true, unparam: true, nomen: true */
'use strict';

var lodash = require('lodash'),
    EventEmitter = require('events').EventEmitter,

    getPaddingValue = function (direction, p) {
        var l =  p && p.length;
        if (direction === 'vertical' || direction === 'horizontal') {
            if (l === 1) {
                return p[0] * 2;
            }
            if (l === 2) {
                return direction === 'vertical' ? p[0] * 2 : p[1] * 2;
            }
            if (l === 3) {
                return direction === 'vertical' ? p[0] + p[2] : p[1] * 2;
            }
            if (l === 4) {
                return direction === 'vertical' ? p[0] + p[2] : p[1] + p[3];
            }
        }
        if (l === 1) {
            return p[0];
        }
        if (l === 2) {
            return direction === 'top' || direction === 'bottom' ? p[0] : p[1];
        }
        if (l === 3) {
            return direction === 'top' ? p[0] : (direction === 'bottom' ? p[2] : p[1]);
        }
        if (l === 4) {
            return direction === 'top' ? p[0] : (
                direction === 'bottom' ? p[2] : (
                    direction === 'left' ? p[3] : p[1]
                )
            );
        }
        return 0;
    },

    addCellBackground = function (self, column, row, pos, index, isHeader) {
        self.emitter.emit('cell-background-add', self, column, row, index, isHeader);

        self.pdf
            .rect(pos.x, pos.y, column.width, row._renderedContent.height)
            .fill();

        self.emitter.emit('cell-background-added', self, column, row, index, isHeader);
    },

    addCellBorder = function (self, column, row, pos, isHeader) {
        self.emitter.emit('cell-border-add', self, column, row, isHeader);

        var border = isHeader ? column.headerBorder : column.border,
        bpos = {
          x: pos.x + column.width,
          y: pos.y + row._renderedContent.height
        };

        if (border.indexOf('L') !== -1) {
          self.pdf.save().moveTo(pos.x, pos.y).lineTo(pos.x, bpos.y).lineCap('square').stroke().restore();
        }
        if (border.indexOf('T') !== -1) {
          self.pdf.save().moveTo(pos.x, pos.y).lineTo(bpos.x, pos.y).lineCap('square').stroke().restore();
        }
        if (border.indexOf('B') !== -1) {
          self.pdf.save().moveTo(pos.x, bpos.y).lineTo(bpos.x, bpos.y).lineCap('square').stroke().restore();
        }
        if (border.indexOf('R') !== -1) {
          self.pdf.save().moveTo(bpos.x, pos.y).lineTo(bpos.x, bpos.y).lineCap('square').stroke().restore();
        }

        self.emitter.emit('cell-border-added', self, column, row, isHeader);
    },

    addCell = function (self, column, row, pos, isHeader) {
        var width = column.width,
            padding = {
                left: 0,
                top: 0
            },
            data = row._renderedContent.data[column.id] || '',
            renderer = isHeader ? column.headerRenderer : column.renderer,
            y = pos.y,
            x = pos.x;

        // Top and bottom padding (only if valign is not set)
        if (!column.valign) {
            if (isHeader) {
                padding.top = getPaddingValue('top', column.headerPadding);
                padding.bottom = getPaddingValue('bottom', column.headerPadding);
                y += padding.top;
            } else if (!isHeader) {
                padding.top = getPaddingValue('top', column.padding);
                padding.bottom = getPaddingValue('bottom', column.padding);
                y += padding.top;
            }
        }

        // Left and right padding
        if (!isHeader) {
            padding.left = getPaddingValue('left', column.padding);
            padding.right = getPaddingValue('right', column.padding);
            width -= getPaddingValue('horizontal', column.padding);
            x += padding.left;
        } else {
            padding.left = getPaddingValue('left', column.headerPadding);
            padding.right = getPaddingValue('right', column.headerPadding);
            width -= getPaddingValue('horizontal', column.headerPadding);
            x += padding.left;
        }

        // if specified, cache is not used and renderer is called one more time
        if (renderer && column.cache === false) {
            data = renderer(self, row, true, column, lodash.clone(pos), padding, isHeader);
        }
        // manage vertical alignement
        if (column.valign === 'center') {
            y += (row._renderedContent.height - row._renderedContent.contentHeight[column.id]) / 2;
        } else if (column.valign === 'bottom') {
            y += (row._renderedContent.height - row._renderedContent.contentHeight[column.id]);
        }

        self.pdf.text(data, x, y, lodash.assign({}, column, {
            height: row._renderedContent.height,
            width: width
        }));

        pos.x += column.width;
    },

    addRow = function (self, row, index, isHeader) {
        var pos = {
                x: self.pos.x || self.pdf.page.margins.left,
                y: self.pdf.y
            },
            ev = {
                cancel: false
            };

        // the content might be higher than the remaining height on the page.
        if (self.pdf.y + row._renderedContent.height > (self.pos.maxY || (self.pdf.page.height - self.pdf.page.margins.bottom) - self.bottomMargin)) {
            self.emitter.emit('page-add', self, row, ev);
            if (!ev.cancel) {
                self.pdf.addPage();
                // Reset Y position for next page
                pos.y = self.pos.y || self.pdf.page.margins.top;
            }
            self.emitter.emit('page-added', self, row);
        }

        lodash.forEach(self.getColumns(), function (column) {
            if ((!isHeader && column.fill) || (isHeader && column.headerFill)) {
                addCellBackground(self, column, row, pos, index, isHeader);
            }
            if ((!isHeader && column.border) || (isHeader && column.headerBorder)) {
                addCellBorder(self, column, row, pos, isHeader);
            }
            addCell(self, column, row, pos, isHeader);
        });

        self.pdf.y = pos.y + row._renderedContent.height;
    },

    setRowHeight = function (self, row, isHeader) {
        var max_height = 0;

        row._renderedContent = {data: {}, dataHeight: {}, contentHeight: {}};

        lodash.forEach(self.getColumns(), function (column) {
            var renderer = isHeader ? column.headerRenderer : column.renderer,
            content = renderer ? renderer(self, row, false) : row[column.id],
                // height = !content ? 1 : self.pdf.heightOfString(content, column),
                height = !content ? 1 : self.pdf.heightOfString(content, lodash.assign(lodash.clone(column), {
                    width: column.width - getPaddingValue('horizontal', column.padding)
                })),
                column_height = isHeader ? column.headerHeight : column.height;

            // Ssetup the content height
            row._renderedContent.contentHeight[column.id] = height;

            // Continue with the row height
            if (isHeader) {
                height += getPaddingValue('vertical', column.headerPadding);
            } else {
                height += getPaddingValue('vertical', column.padding);
            }

            if (height < column_height) {
                height = column_height;
            }

            // backup content so we don't need to call the renderer a second
            // time when really rendering the column
            row._renderedContent.data[column.id] = content;
            row._renderedContent.dataHeight[column.id] = height;

            // check max row height
            max_height = height > max_height ? height : max_height;
        });
        row._renderedContent.height = max_height;
    },

    PdfTable = function (pdf, conf) {
        lodash.merge(this, {
            /**
             * List of columns
             * @var {Array}
             */
            columns: [],

            /**
             * Defaults for all new columns
             * @var {Object}
             */
            columnsDefaults: {},

            /**
             * List of plugins (do not set it at construction time)
             * @var {Array}
             */
            plugins: [],

            /**
             * The number to put inside the pdfkit.moveDown() method
             * @var {Number}
             */
            minRowHeight: 1,

            /**
             * Height of the bottom margin, in point
             * @var {Number}
             */
            bottomMargin: 5,

            /**
             * Check if we want to show headers when {@link addBody()}
             * @var {Boolean}
             */
            showHeaders: true,

            /**
             * Pdf in which the table will be drawn
             * @var {PdfDocument}
             */
            pdf: pdf,

            pos: {
              x: pdf.x,
              y: pdf.y,
            },

            /**
             * Event emitter
             * @var {EventEmitter}
             */
            emitter: new EventEmitter()

        }, lodash.cloneDeep(conf || {}));
    };

lodash.assign(PdfTable.prototype, {

    /**
     * Add action before data rows are added
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Array</i> <b>data</b> complete set of data rows</li>
     * </ul>
     * @return {PdfTable}
     */
    onBodyAdd: function (fn) {
        this.emitter.on('body-add', fn);
        return this;
    },

    /**
     * Add action after data rows are added
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Array</i> <b>data</b> complete set of data rows</li>
     * </ul>
     * @return {PdfTable}
     */
    onBodyAdded: function (fn) {
        this.emitter.on('body-added', fn);
        return this;
    },

    /**
     * Add action before a row is added
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Object</i> <b>row</b> the row to add</li>
     * </ul>
     * @return {PdfTable}
     */
    onRowAdd: function (fn) {
        this.emitter.on('row-add', fn);
        return this;
    },

    /**
     * Add action after a row is added
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Object</i> <b>row</b> the added row</li>
     * </ul>
     * @return {PdfTable}
     */
    onRowAdded: function (fn) {
        this.emitter.on('row-added', fn);
        return this;
    },

    /**
     * Add action before a header is added
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Object</i> <b>row</b> the header row to add</li>
     * </ul>
     * @return {PdfTable}
     */
    onHeaderAdd: function (fn) {
        this.emitter.on('header-add', fn);
        return this;
    },

    /**
     * Add action after a row is added
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Object</i> <b>row</b> the added header row</li>
     * </ul>
     * @return {PdfTable}
     */
    onHeaderAdded: function (fn) {
        this.emitter.on('header-added', fn);
        return this;
    },

    /**
     * Add action before a page is added. You can use <em>ev.cancel = true</em>
     * to cancel automatic page add, so you can do whatever you want to add
     * a new page.
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Object</i> <b>row</b> the current row</li>
     *     <li><i>Object</i> <b>ev</b> the event</li>
     * </ul>
     * @return {PdfTable}
     */
    onPageAdd: function (fn) {
        this.emitter.on('page-add', fn);
        return this;
    },

    /**
     * Add action after a page is added.
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Object</i> <b>row</b> the current row</li>
     * </ul>
     * @return {PdfTable}
     */
    onPageAdded: function (fn) {
        this.emitter.on('page-added', fn);
        return this;
    },

    /**
     * Add action before height is calculated for every row
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Array</i> <b>data</b> complete set of data rows</li>
     * </ul>
     * @return {PdfTable}
     */
    onRowHeightCalculate: function (fn) {
        this.emitter.on('row-height-calculate', fn);
        return this;
    },

    /**
     * Add action after height is calculated for every row
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Array</i> <b>data</b> complete set of data rows</li>
     * </ul>
     * @return {PdfTable}
     */
    onRowHeightCalculated: function (fn) {
        this.emitter.on('row-height-calculated', fn);
        return this;
    },

    /**
     * Add action before height is calculated for the header
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Array</i> <b>data</b> complete set of data rows</li>
     * </ul>
     * @return {PdfTable}
     */
    onHeaderHeightCalculate: function (fn) {
        this.emitter.on('header-height-calculate', fn);
        return this;
    },

    /**
     * Add action after height is calculated for the header
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Array</i> <b>data</b> complete set of data rows</li>
     * </ul>
     * @return {PdfTable}
     */
    onHeaderHeightCalculated: function (fn) {
        this.emitter.on('header-height-calculated', fn);
        return this;
    },

    /**
     * Add action after a column is added
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Object</i> <b>column</b> the added column</li>
     * </ul>
     * @return {PdfTable}
     */
    onColumnAdded: function (fn) {
        this.emitter.on('column-added', fn);
        return this;
    },

    onCellBackgroundAdd: function (fn) {
        this.emitter.on('cell-background-add', fn);
        return this;
    },

    onCellBackgroundAdded: function (fn) {
        this.emitter.on('cell-background-added', fn);
        return this;
    },

    onCellBorderAdd: function (fn) {
        this.emitter.on('cell-border-add', fn);
        return this;
    },

    onCellBorderAdded: function (fn) {
        this.emitter.on('cell-border-added', fn);
        return this;
    },

    /**
     * Add action after a column's property is changed
     * <ul>
     *     <li><i>PdfTable</i> <b>table</b> PdfTable behind the event</li>
     *     <li><i>Object</i> <b>column</b> the column< that changed/li>
     *     <li><i>string</i> <b>prop</b> the property that changed</li>
     *     <li><i>mixed</i> <b>oldValue</b> the property value before change/li>
     * </ul>
     * @return {PdfTable}
     */
    onColumnPropertyChanged: function (fn) {
        this.emitter.on('column-property-changed', fn);
        return this;
    },

    /**
     * Temporary hack to manage overriden addPage() for pdfkit
     *
     * @deprecated
     * @param {Function} fn
     * @return {PdfTable}
     */
    setNewPageFn: function (fn) {
        console.log('setNewPageFn is deprecated. Adding a page during process is automatic now. It will be removed on the next release');
        return this;
    },

    /**
     * Add a plugin
     *
     * @param {Object} plugin the instanciated plugin
     * @return {PdfTable}
     */
    addPlugin: function (plugin) {
        if (!plugin || !plugin.configure) {
            throw new Error('Plugin [' + (plugin && plugin.id) + '] must have a configure() method.');
        }
        this.plugins.push(plugin);
        plugin.configure(this);
        return this;
    },

    /**
     * Get a plugin
     *
     * @param {String} the plugin id
     * @return {Object} the instanciated plugin
     */
    getPlugin: function (id) {
        return lodash.find(this.plugins, {id: id});
    },

    /**
     * Remove a plugin and its events by the key
     *
     * @param {String} id the plugin id
     * @return {PdfTable}
     */
    removePlugin: function (id) {
        lodash.remove(this.plugins, {id: id});
        return this;
    },

    /**
     * Determine if headers need to be displayed or not when .addBody
     *
     * @param {Boolean} show
     * @return {PdfTable}
     */
    setShowHeaders: function (show) {
        this.showHeaders = !!show;
        return this;
    },

    /**
     * Define a column. Config array is mostly what we find in .text()
     *
     * <ul>
     *     <li><i>String</i> <b>id</b>: column id</li>
     *     <li><i>Function</i> <b>renderer</b>: renderer function for cell.
     *     Recieve (PdfTable table, row, draw).</li>
     *     <li><i>Boolean</i> <b>hidden</b>: True to define the column as
     *     hidden (default to false)</li>
     *     <li><i>String</i> <b>border</b>: cell border (LTBR)</li>
     *     <li><i>Number</i> <b>width</b>: column width</li>
     *     <li><i>Number</i> <b>height</b>: min height for cell (default to
     *     standard linebreak)</li>
     *     <li><i>String</i> <b>align</b>: text horizontal align (left, center,
     *     right)</li>
     *     <li><i>String</i> <b>valign</b>: text vertical align (top, center,
     *     bottom)</li>
     *     <li><i>Boolean</i> <b>fill</b>: True to fill the cell with the
     *     predefined color (with pdf.fillColor(color))</li>
     *     <li><i>Boolean</i> <b>cache</b>: false to disable cache content. The
     *     renderer will be called twice (at height calculation time and when
     *     really rendering the content)</li>
     * </ul>
     *
     * Specific to column header
     * <ul>
     *     <li><i>String</i> <b>header</b>: column header text</li>
     *     <li><i>Function</i> <b>headerRenderer</b>: renderer function for
     *     header cell. Recieve (PdfTable table, row)</li>
     *     <li><i>String</i> <b>headerBorder</b>: cell border (LTBR)</li>
     *     <li><i>Boolean</i> <b>headerFill</b>: True to fill the header with
     *     the predefined color (with pdf.fillColor(color))</li>
     *     <li><i>Number</i> <b>headerHeight</b>: min height for cell (default
     *     to standard linebreak)</li>
     * </ul>
     *
     * Work in progress
     * <ul>
     *     <li><i>Array</i> <b>padding</b>: padding for cell. Can be one number
     *     (same padding for LTBR), 2 numbers (same TB and LR) or 4 numbers</li>
     * </ul>
     *
     * @param {Object} column
     * @return {PdfTable}
     */
    addColumn: function (column) {
        this.columns.push(lodash.assign(lodash.clone(this.columnsDefaults || {}), column));
        this.emitter.emit('column-added', this, column);
        return this;
    },

    /**
     * Set defaults for all new columns to add
     *
     * @see addColumn
     * @param {Object} params
     * @return {PdfTable}
     */
    setColumnsDefaults: function (params) {
        this.columnsDefaults = params;
        return this;
    },

    /**
     * Add many columns in one shot
     *
     * @see addColumn
     * @param {Array} columns
     * @return {PdfTable}
     */
    addColumns: function (columns) {
        return this.setColumns(columns, true);
    },

    /**
     * Set columns in one shot
     *
     * @see addColumn
     * @param {Array} columns
     * @param {Boolean} add true to add these columns to existing columns
     * @return {PdfTable}
     */
    setColumns: function (columns, add) {
        var self = this;
        if (!add) {
            this.columns = [];
        }
        lodash.forEach(columns, function (column) {
            self.addColumn(column);
        });
        return this;
    },

    /**
     * Get all table columns
     *
     * @param {Boolean} withHidden true to get hidden columns too
     * @return {Array}
     */
    getColumns: function (withHidden) {
        return !withHidden
            ? lodash.filter(this.columns, function (column) {
                return !column.hidden;
            })
            : this.columns;
    },

    /**
     * Get a definition for a column
     *
     * @param {String} columnId
     * @return {Object}
     */
    getColumn: function (columnId) {
        return lodash.find(this.columns, {id: columnId});
    },

    /**
     * Get width between two columns. Widths of these columns are included in
     * the sum.
     *
     * Example: table.getColumnWidthBetween('B', 'D');
     * <pre>
     * | A | B | C | D | E |
     * |   |-> | ->| ->|   |
     * </pre>
     *
     * If column A is empty, behave like {@link PdfTable.getColumnWidthUntil()}.
     * If column B is empty, behave like {@link PdfTable.getColumnWidthFrom()}.
     *
     * @param {String} columnA start column
     * @param {String} columnB last column
     * @return {Number}
     */
    getColumnWidthBetween: function (columnA, columnB) {
        var width = 0,
            check = false;

        lodash.some(this.getColumns(), function (column) {
            // begin sum either from start, or from column A
            if (column.id === columnA || !columnA) {
                check = true;
            }
            // stop sum if we want width from start to column B
            if (!columnA && column.id === columnB) {
                return true;
            }
            if (check) {
                width += column.width;
            }
            if (column.id === columnB) {
                return true;
            }
        });
        return width;
    },

    /**
     * Get width from start to the given column. Given width's column is not
     * included in the sum.
     *
     * Example: table.getColumnWidthUntil('D');
     * <pre>
     * | A | B | C | D | E |
     * |-> | ->| ->|   |   |
     * </pre>
     *
     * @param {String} columnId column to stop sum
     * @return {Number}
     */
    getColumnWidthUntil: function (columnId) {
        return this.getColumnWidthBetween(null, columnId);
    },

    /**
     * Get width from a column to the end of the table. Given column's width is
     * added to the sum.
     *
     * Example: table.getColumnWidthFrom('D');
     * <pre>
     * | A | B | C | D | E |
     * |   |   |   |-> | ->|
     * </pre>
     *
     * @param {String} columnId the column from which we want to find the width
     * @return {Number}
     */
    getColumnWidthFrom: function (columnId) {
        return this.getColumnWidthBetween(columnId, null);
    },

    /**
     * Get table width (sum of all columns)
     *
     * @return {Number}
     */
    getWidth: function () {
        return this.getColumnWidthUntil(null, null);
    },

    /**
     * Get column width
     *
     * @param {String} columnId
     * @return {Number}
     */
    getColumnWidth: function (columnId) {
        return this.getColumnParam(columnId, 'width');
    },

    /**
     * Set column width
     *
     * @param {String} columnId
     * @param {Number} width
     * @param {Boolean} silent True to prevent event to be emitted
     * @return {PdfTable}
     */
    setColumnWidth: function (columnId, width, silent) {
        return this.setColumnParam(columnId, 'width', width, silent);
    },

    /**
     * Get column param
     *
     * @param {String} columnId
     * @param {String} param the desired param to fetch
     * @return {mixed}
     */
    getColumnParam: function (columnId, param) {
        var column = this.getColumn(columnId);
        return column && column[param];
    },

    /**
     * Set a specific definition for a column
     *
     * @param {String} columnId column string index
     * @param {String} key definition name (align, etc.)
     * @param {mixed} value definition value
     * @param {Boolean} silent True to prevent event to be emitted
     * @return {PdfTable}
     */
    setColumnParam: function (columnId, key, value, silent) {
        var column = this.getColumn(columnId),
            old_value;

        if (column) {
            old_value = column[key];
            column[key] = value;
            if (!silent) {
                this.emitter.emit('column-property-changed', this, column, key, old_value);
            }
        }
        return this;
    },

    /**
     * Add content to the table
     *
     * @param {Array} data the complete set of data
     * @return {PdfTable}
     */
    addBody: function (data) {
        var self = this;
        this.emitter.emit('body-add', this, data);

        var index = 0;

        if (!this.pdf.page) {
            throw new Error("No page available. Add a page to the PDF before calling addBody()");
        }

        if (this.showHeaders) {
            this.addHeader(index);
            index++;
        }

        // calculate height for each row, depending on multiline contents
        this.emitter.emit('row-height-calculate', this, data);
        lodash.forEach(data, function (row) {
            setRowHeight(self, row);
        });
        this.emitter.emit('row-height-calculated', this, data);

        // really add rows, but now we know the exact height of each one
        lodash.forEach(data, function (row, i) {
            var rowIndex = i + index;
            self.emitter.emit('row-add', self, row, rowIndex);
            addRow(self, row, rowIndex);
            self.emitter.emit('row-added', self, row, rowIndex);
        });
        this.emitter.emit('body-added', this, data);

        // Issue #1, restore x position after table is drawn
        this.pdf.x = this.pos.x || this.pdf.page.margins.left;

        // Add margin to the bottom of the table
        self.pdf.y += self.bottomMargin;

        return this;
    },

    /**
     * Add table headers
     *
     * @return {PdfTable}
     */
    addHeader: function (index) {
        var row = lodash.reduce(this.getColumns(), function (acc, column) {
            acc[column.id] = column.header;
            return acc;
        }, {});

        this.emitter.emit('header-add', this, row);

        this.emitter.emit('header-height-calculate', this, row);
        setRowHeight(this, row, true);
        this.emitter.emit('header-height-calculated', this, row);
        addRow(this, row, index, true);

        this.emitter.emit('header-added', this, row);
        return this;
    }
});

module.exports = PdfTable;
