import {useState} from 'react';

const FieldState = (value = "", error = "") => ({
    value, 
    error
});

export const useCampaignFormViewModel = () => {
    const [posterUrl, setPosterUrl] = useState(FieldState());
    const [bannerUrl, setBannerUrl] = useState(FieldState());
    const [campaignTitle, setCampaignTitle] = useState(FieldState());
    const [campaignDescription, setCampaignDescription] = useState(FieldState());
    const [campaignTarget, setCampaignTarget] = useState(FieldState());
    const [campaignEndDate, setCampaignEndDate] = useState(FieldState());
    const [nftName, setNftName] = useState(FieldState());
    const [nftSymbol, setNftSymbol] = useState(FieldState());

    const handleFieldChange = (field, value) => {
        switch (field) {
            case "posterUrl":
                setPosterUrl(prev => ({ ...prev, value: value, error: "" }));
                break;
            case "bannerUrl":
                setBannerUrl(prev => ({ ...prev, value: value, error: "" }));
                break;
            case "campaignTitle":
                setCampaignTitle(prev => ({ ...prev, value: value, error: "" }));
                break;
            case "campaignDescription":
                setCampaignDescription(prev => ({ ...prev, value: value, error: "" }));
                break;
            case "campaignTarget":
                setCampaignTarget(prev => ({ ...prev, value: value, error: "" }));
                break;
            case "campaignEndDate":
                setCampaignEndDate(prev => ({ ...prev, value: value, error: "" }));
                break;
            case "nftName":
                setNftName(prev => ({ ...prev, value: value, error: "" }));
                break;
            case "nftSymbol":
                setNftSymbol(prev => ({ ...prev, value: value, error: "" }));
                break;
            default:
                break;
        }
    };

    const checkValidity = () => {
        if (posterUrl.value === "") {
            setPosterUrl(prev => ({ ...prev, error: "invalid" }));
        }
        if (bannerUrl.value === "") {
            setBannerUrl(prev => ({ ...prev, error: "invalid" }));
        }
        if (campaignTitle.value === "") {
            setCampaignTitle(prev => ({ ...prev, error: "invalid" }));
        }
        if (campaignDescription.value === "") {
            console.log("campaignDescription is empty");
            setCampaignDescription(prev => ({ ...prev, error: "invalid" }));
        }
        if (campaignTarget.value === "") {
            setCampaignTarget(prev => ({ ...prev, error: "invalid" }));
        }
        if (campaignEndDate.value === "") {
            setCampaignEndDate(prev => ({ ...prev, error: "invalid" }));
        }
        if (nftName.value === "") {
            setNftName(prev => ({ ...prev, error: "invalid" }));
        }
        if (nftSymbol.value === "") {
            setNftSymbol(prev => ({ ...prev, error: "invalid" }));
        }
    }

    return {
        posterUrl,
        bannerUrl,
        campaignTitle,
        campaignDescription,
        campaignTarget,
        campaignEndDate,
        nftName,
        nftSymbol,
        handleFieldChange,
        checkValidity
    };

};
