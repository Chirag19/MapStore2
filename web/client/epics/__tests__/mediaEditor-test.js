/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {testEpic, addTimeoutEpic, TEST_TIMEOUT} from './epicTestUtils';

import {
    loadMediaEditorDataEpic,
    editorSaveUpdateMediaEpic,
    mediaEditorNewMap,
    mediaEditorEditMap,
    reloadMediaResources,
    importInLocalSource
} from '../mediaEditor';
import {
    show as showMapEditor,
    save,
    HIDE
} from '../../actions/mapEditor';
import {
    loadMedia,
    saveMedia,
    show,
    setEditingMedia,
    importInLocal,
    ADDING_MEDIA,
    EDITING_MEDIA,
    LOAD_MEDIA_SUCCESS,
    SAVE_MEDIA_SUCCESS,
    SELECT_ITEM,
    UPDATE_ITEM,
    LOAD_MEDIA,
    SET_MEDIA_SERVICE
} from '../../actions/mediaEditor';

describe('MediaEditor Epics', () => {

    it('loadMediaEditorDataEpic with loadMedia ', (done) => {
        const NUM_ACTIONS = 1;
        const params = {mediaType: "image"};
        const mediaType = "image";
        const resultData = {
            resources: [{id: "resId", type: "image"}],
            totalCount: 1
        };
        const sourceId = "geostory";
        testEpic(loadMediaEditorDataEpic, NUM_ACTIONS, loadMedia(params, mediaType, sourceId), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case LOAD_MEDIA_SUCCESS:
                    expect(a.params).toEqual(params);
                    expect(a.mediaType).toEqual(mediaType);
                    expect(a.sourceId).toEqual(sourceId);
                    expect(a.resultData).toEqual(resultData);
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {
            geostory: {
                currentStory: {
                    resources: [{
                        id: "resId",
                        type: "image"
                    }]}
            },
            mediaEditor: {
                settings: {
                    sourceId
                }
            }
        });
    });
    it('loadMediaEditorDataEpic with show and 0 resources', (done) => {
        const NUM_ACTIONS = 1;
        const sourceId = "geostory";
        testEpic(addTimeoutEpic(loadMediaEditorDataEpic, 10), NUM_ACTIONS, show("geostory"), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
        }, {
            geostory: {
                currentStory: {
                    resources: []
                }
            },
            mediaEditor: {
                settings: {
                    sourceId
                }
            }
        });
    });
    it('editorSaveUpdateMediaEpic add new media', (done) => {
        const NUM_ACTIONS = 3;
        const source = "geostory";
        const type = "image";
        const data = {};
        testEpic(editorSaveUpdateMediaEpic, NUM_ACTIONS, saveMedia({type, source, data}), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case SAVE_MEDIA_SUCCESS:
                    expect(a.id.length).toEqual(36);
                    expect(a.mediaType).toEqual(type);
                    expect(a.source).toEqual(source);
                    expect(a.data).toEqual(data);
                    break;
                case ADDING_MEDIA:
                    expect(a.adding).toEqual(false);
                    break;
                case SELECT_ITEM:
                    expect(a.id.length).toEqual(36);
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {
            geostory: {},
            mediaEditor: {
                saveState: {
                    adding: true
                },
                selected: "id",
                settings: {
                    sourceId: "geostory"
                }
            }
        });
    });

    it('editorSaveUpdateMediaEpic update media', (done) => {
        const NUM_ACTIONS = 2;
        const source = "geostory";
        const type = "image";
        const data = {src: "http", title: "title"};
        testEpic(editorSaveUpdateMediaEpic, NUM_ACTIONS, saveMedia({type, source, data}), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case SAVE_MEDIA_SUCCESS:
                    expect(a.id.length).toEqual(36);
                    expect(a.mediaType).toEqual(type);
                    expect(a.source).toEqual(source);
                    expect(a.data).toEqual(data);
                    break;
                case EDITING_MEDIA:
                    expect(a.editing).toEqual(false);
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {
            geostory: {
                resources: [{
                    id: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                    data: {
                        src: "ht",
                        title: "ti"
                    }
                }]
            },
            mediaEditor: {
                saveState: {
                    editing: true,
                    adding: true
                },
                selected: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                settings: {
                    sourceId: "geostory"
                }
            }
        });
    });
    it('mediaEditorNewMap epic handle new map creation save stream', (done) => {
        const NUM_ACTIONS = 3;
        const type = "map";
        testEpic(mediaEditorNewMap, NUM_ACTIONS, [showMapEditor("mediaEditor"), save({}, "mediaEditor")], (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case LOAD_MEDIA_SUCCESS:
                    expect(a.mediaType).toEqual(type);
                    expect(a.sourceId).toEqual('geostory');
                    expect(a.resultData).toExist();
                    break;
                case SELECT_ITEM:
                    expect(a.id).toExist();
                    break;
                case HIDE:
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {
            geostory: {
                resources: [{
                    id: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                    data: {
                        src: "ht",
                        title: "ti"
                    }
                }]
            },
            mediaEditor: {
                saveState: {
                    editing: false,
                    adding: true
                },
                selected: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                settings: {
                    sourceId: "geostory"
                }
            }
        });
    });
    it('mediaEditorEditMap epic handle edit map save stream', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(mediaEditorEditMap, NUM_ACTIONS, [showMapEditor("mediaEditor", {}), save({}, "mediaEditor")], (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case UPDATE_ITEM:
                    expect(a.item).toExist();
                    break;
                case HIDE:
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {
            geostory: {
                resources: [{
                    id: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                    data: {
                        src: "ht",
                        title: "ti"
                    }
                }]
            },
            mediaEditor: {
                saveState: {
                    editing: false,
                    adding: true
                },
                selected: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                settings: {
                    sourceId: "geostory"
                }
            }
        });
    });
    it('reloadMediaResources epic load resources when editing form close', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(reloadMediaResources, NUM_ACTIONS, setEditingMedia(false), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case LOAD_MEDIA:
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {});
    });
    it('importInLocalSource epic handle new map creation save stream', (done) => {
        const NUM_ACTIONS = 4;
        testEpic(importInLocalSource, NUM_ACTIONS, importInLocal({resource: {id: 'testId', type: 'map'}}), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case SET_MEDIA_SERVICE:
                    expect(a.id).toEqual('geostory');
                    break;
                case SAVE_MEDIA_SUCCESS:
                    expect(a.data.id).toEqual('testId');
                    break;
                case LOAD_MEDIA:
                    break;
                case SELECT_ITEM:
                    expect(a.id).toExist();
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {
            geostory: {
                resources: [{
                    id: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                    data: {
                        src: "ht",
                        title: "ti"
                    }
                }]
            },
            mediaEditor: {
                saveState: {
                    editing: false,
                    adding: true
                },
                selected: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                settings: {
                    sourceId: "geostory",
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: "geostory"
                        }
                    }
                }
            }
        });
    });
});
