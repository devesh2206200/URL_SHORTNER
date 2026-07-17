import { useState } from "react"
import { PulseLoader } from "react-spinners";
import { Settings, Calendar, HelpCircle } from "lucide-react";
import toast from 'react-hot-toast';
import { shortenUrl } from "../api/api";

export default function Shortener(props) {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    
    // Advanced options state
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [customAlias, setCustomAlias] = useState("")
    const [expiration, setExpiration] = useState("never")

    function handleInputChange(e) {
        setInput(e.target.value)
    }

    async function handleClick() {
        if (input === "") return;

        setLoading(true);

        try {
            let expiresAt = null;

            if (expiration === "1h") {
                expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            } else if (expiration === "1d") {
                expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            } else if (expiration === "7d") {
                expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            }

            const requestBody = {
                url: input,
            };

            if (showAdvanced) {
                if (customAlias.trim()) {
                    requestBody.customAlias = customAlias.trim();
                }

                if (expiresAt) {
                    requestBody.expiresAt = expiresAt;
                }
            }

            const data = await shortenUrl(requestBody, props.token);

            const newItem = {
                url: input,
                shortUrl: data.data.shortUrl,
                shortUrlId: data.data.shortUrlId,
                customAlias: customAlias.trim() || null,
                expiresAt,
                clicks: data.data.clicks,
            };

            props.addLink(newItem);
            toast.success("URL shortened successfully!");

            setInput("");
            setCustomAlias("");
            setExpiration("never");
            setShowAdvanced(false);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Server Connection Error");
        } finally {
            setLoading(false);
        }
    }

    const override = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }

    return (
        <div className="shortener rounded-lg">
            <form className="shortener-form">
                <div className="input-row">
                    <div className="input-area">
                        <input 
                            type="url" 
                            placeholder="Shorten a link here..." 
                            id="input" 
                            onChange={handleInputChange} 
                            value={input} 
                        />
                        <p className="warning">Please add a link</p>
                    </div>
                    <button className="btn-cta" type="button" onClick={handleClick} disabled={loading}>
                        {loading ? (
                            <PulseLoader
                                color={'white'}
                                cssOverride={override}
                                size={11}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        ) : 'Shorten it!'}
                    </button>
                </div>

                {/* Advanced Toggle */}
                <div className="advanced-toggle-area">
                    <button 
                        type="button" 
                        className={`btn-toggle-advanced ${showAdvanced ? 'active' : ''}`}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <Settings size={14} />
                        Advanced Options {props.token ? '' : '(Login for custom alias)'}
                    </button>
                </div>

                {/* Advanced Panel */}
                {showAdvanced && (
                    <div className="advanced-panel-grid animate-slide-down">
                        <div className="advanced-field">
                            <label htmlFor="custom-alias">
                                Custom Alias
                                <span className="help-icon" title="Customize the back-half of your URL (e.g. short.ly/my-link). Minimum 3 characters.">
                                    <HelpCircle size={12} />
                                </span>
                            </label>
                            <input
                                type="text"
                                id="custom-alias"
                                placeholder={props.token ? "e.g. my-portfolio" : "Login required for alias"}
                                value={customAlias}
                                onChange={(e) => setCustomAlias(e.target.value)}
                                disabled={!props.token}
                            />
                        </div>

                        <div className="advanced-field">
                            <label htmlFor="expiration">
                                Expiration Date
                                <span className="help-icon" title="Choose when this link should stop redirecting.">
                                    <HelpCircle size={12} />
                                </span>
                            </label>
                            <div className="select-wrapper">
                                <Calendar size={14} className="select-icon" />
                                <select 
                                    id="expiration" 
                                    value={expiration} 
                                    onChange={(e) => setExpiration(e.target.value)}
                                >
                                    <option value="never">Never Expire</option>
                                    <option value="1h">Expire in 1 Hour</option>
                                    <option value="1d">Expire in 1 Day</option>
                                    <option value="7d">Expire in 7 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}