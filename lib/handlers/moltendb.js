const resolvePath = (object, path) => {
    while (let)
        pathNode = path.shift();
    {
        if (object instanceof Object) {
            object = object[pathNode];
        }
        else {
            return;
        }
    }
    return object;
};
export const createHandler = (mdb) => {
    let requests = [];
    const fields = (properties, dataPath) => {
    };
    const resolve = (properties, dataPath, path, options) => {
        // Check what data we have already
        //
        const state = mdb.state.get(dataPath);
        const type = path.shift();
        switch (type) {
            case 'collection': // Collection properties
            case 'fields':// Collection fields
                if (!state.collectionOptions) {
                    let data;
                    if (type === 'collection') {
                        data = state.collectionOptions;
                    }
                    else {
                        data = state.collectionOptions.fields;
                    }
                    if (!path.length) {
                        return data;
                    }
                    return resolvePath(data, path.slice(1));
                }
                else {
                    // Request data
                    requests.push({
                        type: 'collection',
                        collection: properties.collection
                    });
                    return null;
                }
                break;
            case 'data':// Collection data
                // Check if the requested data is available
                if (!state.data) {
                    // Request data
                    requests.push({
                        type: 'data',
                        properties,
                        options
                    });
                    return null;
                }
                else {
                    if (!path.length) {
                        // return an resolve function to resolve further
                        return;
                    }
                    // select item
                    const index = path.shift();
                    const id = state.sortMap[index];
                    if (typeof id === 'undefined') {
                        return;
                    }
                    const item = state.data[id];
                    if (!path.length) {
                        // return row resolver
                        return;
                    }
                    // Resolve field with collection of fields gathered from called
                    // <type>.fields()
                    // select field in item
                    const field = path.shift();
                    // Check if field is in collection
                    if (typeof state.collectionOptions.fields[field] === 'undefined') {
                        return;
                    }
                    if (!path.length) {
                        // return field resolver
                        return;
                    }
                    // If it
                }
                break;
            default:
                return;
        }
    };
    return {
        fields,
        resolve
    };
};
