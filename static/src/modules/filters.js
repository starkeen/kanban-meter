export default {
    hasUpdate(nextProps, currenProps) {
        let filterByTeamHasChanged;
        let filterByIncludeLabelsChanged;
        let filterByExcludeLabelsChanged;

        if (Array.isArray(nextProps.filterByTeam)) {
            if (nextProps.filterByTeam.length !== currenProps.filterByTeam.length) {
                filterByTeamHasChanged = true;
            } else {
                filterByTeamHasChanged = !nextProps.filterByTeam.every((item) => {
                    return currenProps.filterByTeam.indexOf(item) !== -1;
                });
            }
        } else {
            filterByTeamHasChanged = nextProps.filterByTeam !== currenProps.filterByTeam;
        }

        if (Array.isArray(nextProps.filterIncludeLabels)) {
            if (nextProps.filterIncludeLabels.length !== currenProps.filterIncludeLabels.length) {
                filterByIncludeLabelsChanged = true;
            } else {
                filterByIncludeLabelsChanged = !nextProps.filterIncludeLabels.every((item) => {
                    return currenProps.filterIncludeLabels.indexOf(item) !== -1;
                });
            }
        } else {
            filterByIncludeLabelsChanged = nextProps.filterIncludeLabels !== currenProps.filterIncludeLabels;
        }

        if (Array.isArray(nextProps.filterExcludeLabels)) {
            if (nextProps.filterExcludeLabels.length !== currenProps.filterExcludeLabels.length) {
                filterByExcludeLabelsChanged = true;
            } else {
                filterByExcludeLabelsChanged = !nextProps.filterExcludeLabels.every((item) => {
                    return currenProps.filterExcludeLabels.indexOf(item) !== -1;
                });
            }
        } else {
            filterByExcludeLabelsChanged = nextProps.filterExcludeLabels !== currenProps.filterExcludeLabels;
        }

        return (
            nextProps.filterTax !== currenProps.filterTax ||
            nextProps.filterByOpen !== currenProps.filterByOpen ||
            filterByTeamHasChanged ||
            nextProps.filterDateStart !== currenProps.filterDateStart ||
            nextProps.filterDateEnd !== currenProps.filterDateEnd ||
            filterByIncludeLabelsChanged ||
            filterByExcludeLabelsChanged
        );
    },
};
