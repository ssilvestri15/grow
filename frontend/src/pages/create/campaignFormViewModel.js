import {useState} from 'react';
import {createCampaign} from '../../utils/CrowdfundingManager';

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
                const result = generateShortNameAndSymbol(value);
                console.log(result);
                setNftName(prev => ({ ...prev, value: result.shortName.toUpperCase(), error: "" }));
                setNftSymbol(prev => ({ ...prev, value: result.symbol.toUpperCase(), error: "" }));
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
        let valid = true;
        if (posterUrl.value === "") {
            setPosterUrl(prev => ({ ...prev, error: "invalid" }));
            valid = false;
        }
        if (bannerUrl.value === "") {
            setBannerUrl(prev => ({ ...prev, error: "invalid" }));
            valid = false;
        }
        if (campaignTitle.value === "") {
            setCampaignTitle(prev => ({ ...prev, error: "invalid" }));
            valid = false;
        }
        if (campaignDescription.value === "" || campaignDescription.value.length > 1000) {
            setCampaignDescription(prev => ({ ...prev, error: "invalid" }));
            valid = false;
        }
        if (campaignTarget.value === "" || campaignTarget.value < 0.4) {
            setCampaignTarget(prev => ({ ...prev, error: "invalid" }));
            valid = false;
        }
        if (campaignEndDate.value === "" ) {
            setCampaignEndDate(prev => ({ ...prev, error: "invalid" }));
            valid = false;
        } else {
            const timestamp = new Date(campaignEndDate.value).getTime();
            const currentTimestamp = Date.now();
            const difference = timestamp - currentTimestamp;
            if (difference <= 86400000) {
                setCampaignEndDate(prev => ({ ...prev, error: "invalid" }));
                valid = false;
            }
        }
        if (nftName.value === "") {
            setNftName(prev => ({ ...prev, error: "invalid" }));
            valid = false;
        }
        if (nftSymbol.value === "") {
            setNftSymbol(prev => ({ ...prev, error: "invalid" }));
            valid = false;
        }
        return valid;
    }

    const createAndPay = async () => {
        if (!checkValidity()) {
            return;
        }
        const timestamp = new Date(campaignEndDate.value).getTime();
        const currentTimestamp = Date.now();
        const difference = timestamp - currentTimestamp;
        const duration = Math.floor(difference / 86400000);
        try {
            const result =  await createCampaign(
                campaignTitle.value,
                campaignDescription.value,
                bannerUrl.value,
                posterUrl.value,
                nftName.value,
                nftSymbol.value,
                campaignTarget.value,
                duration,
            );
            console.log(result);
        } catch (error) {
            console.log(error);
            return "";
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
        createAndPay
    };

    function generateShortNameAndSymbol(projectName, suffix = "NFT") {

        if (projectName.length === 0) {
            return { shortName: "", symbol: "" };
        }

        const words = projectName.match(/[A-Z][a-z]*|[a-z]+/g) || [projectName];
        const shortName = words.slice(0, 2).map(word => word.substring(0, 5)).join("") + suffix;
        const symbol = words.slice(0, 2).map(word => word[0].toUpperCase()).join("") + suffix;
        return { shortName, symbol };
    }

};
