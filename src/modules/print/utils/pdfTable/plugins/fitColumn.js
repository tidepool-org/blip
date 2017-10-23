/*jslint node: true, unparam: true, nomen: true */
'use strict';

var lodash = require('lodash'),

    /**
     * Plugin constructor. Configuration may take parameters listed below.
     *
     * @param {String} column stretched column index
     * @param {Number} maxWidth table max width. Default to page width minus
     * margins
     */
    PdfTableFitColumn = function (conf) {
        lodash.merge(this, {

            id: 'fitcolumn',

            /**
             * Stretched column index
             * @var {String}
             */
            column: null,

            /**
             * Table max width. Default to page width minus margins
             * @var {Number}
             */
            maxWidth: null,

            /**
             * Calculated width at EV_BODY_ADD event
             * @var {Number}
             */
            calculatedWidth: null

        }, lodash.clone(conf || {}));
    };

lodash.assign(PdfTableFitColumn.prototype, {

    /**
     * Configure plugin by attaching functions to table events
     *
     * @param {PdfTable}
     * @return {void}
     */
    configure: function (table) {
        table
            .onBodyAdd(this.setWidth.bind(this))
            .onColumnAdded(this.onColumnAdded.bind(this))
            .onColumnPropertyChanged(this.onColumnPropertyChanged.bind(this));
    },

    /**
     * Reinit width after a column is added
     *
     * @param {PdfTable}
     * @return {PdfTableFitColumn}
     */
    onColumnAdded: function (table) {
        return this.reinitWidth(table);
    },

    /**
     * Reinit width after width or hidden property changed
     *
     * @param {PdfTable} table
     * @param {Object} column
     * @param {String} prop
     * @return {PdfTableFitColumn}
     */
    onColumnPropertyChanged: function (table, column, prop) {
        // manage width changes and show/hide changes
        if (prop !== 'width' && prop !== 'hidden') {
            return this;
        }
        return this.reinitWidth(table);
    },

    /**
     * Reset width, so calculation can be re-executed
     *
     * @return {PdfTableFitColumn}
     */
    resetWidth: function () {
        this.calculatedWidth = null;
        return this;
    },

    /**
     * Reinit width
     *
     * @param {PdfTable} table
     * @return {PdfTableFitColumn}
     */
    reinitWidth: function (table) {
        return this
            .resetWidth()
            .setWidth(table);
    },

    /**
     * Check the max width of the stretched column. This method is called just
     * before we start to add data rows
     *
     * @param {PdfTable} table
     * @return {void}
     */
    setWidth: function (table) {
        if (!table.pdf.page) {
            return;
        }
        if (this.calculatedWidth === null) {
            var self = this,
                content_width = this.maxWidth,
                width = lodash.sumBy(table.getColumns(), function (column) {
                    return column.id !== self.column ? column.width : 0;
                });

            if (!content_width) {
                content_width = table.pdf.page.width
                    - table.pdf.page.margins.left
                    - table.pdf.page.margins.right;
            }

            this.calculatedWidth = content_width - width;
            if (this.calculatedWidth < 0) {
                this.calculatedWidth = 0;
            }
        }
        table.setColumnWidth(this.column, this.calculatedWidth, true);
    }

});

module.exports = PdfTableFitColumn;
