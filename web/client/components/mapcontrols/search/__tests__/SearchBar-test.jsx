/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react');
var ReactDOM = require('react-dom');
var SearchBar = require('../SearchBar');

const TestUtils = require('react-dom/test-utils');

describe("test the SearchBar", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        const tb = ReactDOM.render(<SearchBar/>, document.getElementById("container"));
        expect(tb).toExist();
    });

    it('test search and reset on enter', () => {
        const renderSearchBar = (testHandlers, text) => {
            return ReactDOM.render(<SearchBar searchText={text} delay={0} typeAhead={false} onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler} onSearchTextChange={testHandlers.onSearchTextChangeHandler}/>, document.getElementById("container"));
        };

        var tb;
        const testHandlers = {
            onSearchHandler: (text) => { return text; },
            onSearchResetHandler: () => {}
        };
        testHandlers.onSearchTextChangeHandler = renderSearchBar.bind(null, testHandlers);

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        tb = renderSearchBar(testHandlers);
        let input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0]);

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spy.calls.length).toEqual(1);
        input.value = "";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spyReset.calls.length).toEqual(1);
    });

    it('test search and reset buttons', () => {
        let tb;
        const renderSearchBar = (testHandlers, text) => {
            return ReactDOM.render(
                <SearchBar
                    searchText={text}
                    delay={0}
                    typeAhead={false}
                    onSearch={testHandlers.onSearchHandler}
                    onSearchReset={testHandlers.onSearchResetHandler}
                    onSearchTextChange={testHandlers.onSearchTextChangeHandler}/>, document.getElementById("container"));
        };

        const testHandlers = {
            onSearchHandler: (text) => { return text; }
        };
        testHandlers.onSearchResetHandler = renderSearchBar.bind(null, testHandlers, '');
        testHandlers.onSearchTextChangeHandler = renderSearchBar.bind(null, testHandlers);

        const spyReset = expect.spyOn(testHandlers, 'onSearchResetHandler');
        spyReset.andCallThrough();
        tb = renderSearchBar(testHandlers);
        let input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0]);
        // test reset button
        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        let reset = TestUtils.findRenderedDOMComponentWithClass(tb, "glyphicon-1-close");
        expect(reset).toExist();
        let search = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-search")[0];
        expect(search).toExist();
        TestUtils.Simulate.click(reset);
        expect(spyReset.calls.length).toEqual(1);
        expect(input.value).toEqual("");

    });

    it('test typeahead', (done) => {
        var tb;

        const renderSearchBar = (testHandlers, text) => {
            return ReactDOM.render(<SearchBar searchText={text} delay={0} typeAhead onSearch={testHandlers.onSearchHandler} onSearchReset={testHandlers.onSearchResetHandler} onSearchTextChange={testHandlers.onSearchTextChangeHandler}/>, document.getElementById("container"));
        };

        const testHandlers = {
            onSearchHandler: (text) => { return text; }
        };
        testHandlers.onSearchTextChangeHandler = renderSearchBar.bind(null, testHandlers);

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        tb = renderSearchBar(testHandlers);
        let input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0]);

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        setTimeout(() => {expect(spy.calls.length).toEqual(1); done(); }, 50);
    });

    it('test focus and blur events', (done) => {
        const testHandlers = {
            onSearchHandler: (text) => {return text; },
            onPurgeResultsHandler: () => {}
        };

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        const spyReset = expect.spyOn(testHandlers, 'onPurgeResultsHandler');
        let tb = ReactDOM.render(<SearchBar searchText="test" delay={0} typeAhead blurResetDelay={0} onSearch={testHandlers.onSearchHandler} onPurgeResults={testHandlers.onPurgeResultsHandler}/>, document.getElementById("container"));
        let input = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0];
        expect(input).toExist();
        input = ReactDOM.findDOMNode(input);
        input.value = "test";

        TestUtils.Simulate.click(input);
        TestUtils.Simulate.focus(input);
        TestUtils.Simulate.blur(input);
        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            expect(spyReset.calls.length).toEqual(1);
            done();
        }, 50);
    });
    it('test autofocus on selected items', (done) => {
        let tb = ReactDOM.render(<SearchBar searchText="test" delay={0} typeAhead blurResetDelay={0} />, document.getElementById("container"));
        let input = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0];
        expect(input).toExist();
        let spyOnFocus = expect.spyOn(input, 'focus');
        input = ReactDOM.findDOMNode(input);
        input.value = "test";
        TestUtils.Simulate.blur(input);
        ReactDOM.render(<SearchBar searchText="test" delay={0} typeAhead blurResetDelay={0} selectedItems={[{text: "TEST"}]}/>, document.getElementById("container"));
        setTimeout(() => {
            expect(spyOnFocus.calls.length).toEqual(1);
            done();
        }, 210);
    });

    it('test that options are passed to search action', () => {
        var tb;
        let searchOptions = {displaycrs: "EPSG:3857"};

        const renderSearchBar = (testHandlers, text) => {
            return ReactDOM.render(
                <SearchBar
                    searchOptions={searchOptions}
                    searchText={text}
                    delay={0}
                    maxResults={23}
                    typeAhead={false}
                    onSearch={testHandlers.onSearchHandler}
                    onSearchReset={testHandlers.onSearchResetHandler}
                    onSearchTextChange={testHandlers.onSearchTextChangeHandler}
                />, document.getElementById("container")
            );
        };

        const testHandlers = {
            onSearchHandler: (text, options) => { return [text, options]; }
        };
        testHandlers.onSearchTextChangeHandler = renderSearchBar.bind(null, testHandlers);

        const spy = expect.spyOn(testHandlers, 'onSearchHandler');
        tb = renderSearchBar(testHandlers);
        let input = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0]);

        expect(input).toExist();
        input.value = "test";
        TestUtils.Simulate.change(input);
        TestUtils.Simulate.keyDown(input, {key: "Enter", keyCode: 13, which: 13});
        expect(spy.calls.length).toEqual(1);
        expect(spy).toHaveBeenCalledWith('test', searchOptions, 23);
    });
    it('test error and loading status', () => {
        const tb = ReactDOM.render(<SearchBar loading error={{message: "TEST_ERROR"}}/>, document.getElementById("container"));
        expect(tb).toExist();
        let error = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(tb, "searcherror")[0]);
        expect(error).toExist();
    });

    it('test cancel items', (done) => {
        const testHandlers = {
            onCancelSelectedItem: () => {}
        };

        const spy = expect.spyOn(testHandlers, 'onCancelSelectedItem');
        let tb = ReactDOM.render(<SearchBar searchText="test" delay={0} typeAhead blurResetDelay={0} onCancelSelectedItem={testHandlers.onCancelSelectedItem} />, document.getElementById("container"));
        let input = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input")[0];
        expect(input).toExist();
        input = ReactDOM.findDOMNode(input);

        // backspace with empty searchText causes trigger of onCancelSelectedItem
        ReactDOM.render(<SearchBar searchText="" delay={0} typeAhead blurResetDelay={0} onCancelSelectedItem={testHandlers.onCancelSelectedItem} selectedItems={[{text: "TEST"}]}/>, document.getElementById("container"));
        TestUtils.Simulate.keyDown(input, {key: "Backspace", keyCode: 8, which: 8});
        setTimeout(() => {
            expect(spy.calls.length).toEqual(1);
            done();
        }, 10);
    });

    it('test search and reset buttons both present, splitTools=false', () => {
        const tb = ReactDOM.render(<SearchBar splitTools={false} searchText={"some val"} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = TestUtils.findRenderedDOMComponentWithClass(tb, "glyphicon-1-close");
        let search = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-search");
        expect(reset).toExist();
        expect(search).toExist();
        expect(search.length).toBe(2);
    });
    it('test only search present, splitTools=false', () => {
        const tb = ReactDOM.render(<SearchBar splitTools={false} searchText={""} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-1-close");
        expect(reset.length).toBe(0);

        let search = TestUtils.findRenderedDOMComponentWithClass(tb, "magnifying-glass");
        expect(search).toExist();
    });


    it('test only search present, splitTools=true', () => {
        const tb = ReactDOM.render(<SearchBar splitTools searchText={""} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-1-close");
        expect(reset.length).toBe(0);

        let search = TestUtils.findRenderedDOMComponentWithClass(tb, "magnifying-glass");
        expect(search).toExist();
    });

    it('test only reset present, splitTools=true', () => {
        const tb = ReactDOM.render(<SearchBar splitTools searchText={"va"} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = TestUtils.findRenderedDOMComponentWithClass(tb, "glyphicon-1-close");
        let search = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-search");
        expect(reset).toExist();
        expect(search.length).toBe(1);
    });
    it('test zoomToPoint, with search, with decimal, with reset', () => {
        const tb = ReactDOM.render(<SearchBar format="decimal" coordinate={{"lat": 2, "lon": 2}} activeSearchTool="coordinatesSearch" showOptions searchText={"va"} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-1-close");
        let search = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-search");
        let cog = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-cog");
        expect(reset.length).toBe(1);
        expect(search.length).toBe(2);
        expect(cog.length).toBe(2);
    });

    it('test zoomToPoint, with search, with aeronautical, with reset', () => {
        const tb = ReactDOM.render(<SearchBar format="aeronautical" activeSearchTool="coordinatesSearch" showOptions searchText={"va"} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-1-close");
        let search = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-search");
        let cog = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-cog");
        let inputs = TestUtils.scryRenderedDOMComponentsWithTag(tb, "input");
        expect(reset.length).toBe(0);
        expect(search.length).toBe(2);
        expect(cog.length).toBe(2);
        expect(inputs.length).toBe(6);
    });

    it('test calling zoomToPoint with onKeyDown event', (done) => {
        const tb = ReactDOM.render(
            <SearchBar
                format="decimal"
                activeSearchTool="coordinatesSearch"
                showOptions
                onZoomToPoint={(point, zoom, crs) => {
                    expect(point).toEqual({x: 15, y: 15});
                    expect(zoom).toEqual(12);
                    expect(crs).toEqual("EPSG:4326");
                    done();
                }}
                coordinate={{lat: 15, lon: 15}}
                typeAhead={false} />, document.getElementById("container")
        );
        expect(tb).toExist();
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 13
        });
    });
    it('Test SearchBar with not allowed e char for keyDown event', (done) => {
        const tb = ReactDOM.render(
            <SearchBar
                format="decimal"
                activeSearchTool="coordinatesSearch"
                showOptions
                onZoomToPoint={() => {
                    expect(true).toBe(false);
                }}
                coordinate={{lat: 15, lon: 15}}
                typeAhead={false} />, document.getElementById("container")
        );
        expect(tb).toExist();
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(2);
        expect(elements[0].value).toBe('15');

        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 69, // char e
            preventDefault: () => {
                expect(true).toBe(true);
                done();
            }
        });
    });
    it('Test SearchBar with valid onKeyDown event by pressing number 8', () => {
        const tb = ReactDOM.render(
            <SearchBar
                format="decimal"
                activeSearchTool="coordinatesSearch"
                showOptions
                onZoomToPoint={() => {
                    expect(true).toBe(false);
                }}
                coordinate={{lat: 1, lon: 1}}
                typeAhead={false} />, document.getElementById("container")
        );
        expect(tb).toExist();
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(2);
        expect(elements[0].value).toBe('1');

        TestUtils.Simulate.keyDown(elements[0], {
            keyCode: 56,
            preventDefault: () => {
                expect(true).toBe(false);
            }
        });
    });

    it('test showOptions false, only address tool visible', () => {
        const tb = ReactDOM.render(<SearchBar showOptions={false} searchText={""} delay={0} typeAhead={false} />, document.getElementById("container"));
        let reset = TestUtils.findRenderedDOMComponentWithClass(tb, "glyphicon-search");
        let cog = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-cog");
        let zoom = TestUtils.scryRenderedDOMComponentsWithClass(tb, "glyphicon-zoom-to");
        expect(reset).toExist();
        expect(cog.length).toBe(0);
        expect(zoom.length).toBe(0);
    });
});
