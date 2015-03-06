/** @jsx React.DOM */

var React = require('react');
var Tran = require('./../Tran.jsx');


var FormatedPrice = React.createClass({
	getInitialState: function() {
		return {
			currentCurrency: currencyManager.current,
			subscribeToken: null
		};
	},
	handleCurrencyChanged: function (newCurrency) {
		this.setState({
			currentCurrency: newCurrency
		});
	},
	componentDidMount: function() {
		var token = PubSub.subscribe( 'currencyChanged', this.handleCurrencyChanged );
		this.setState({
			subscribeToken: token
		});
	},
	componentWillUnmount: function() {
		if (this.state.subscribeToken) {
			PubSub.unsubscribe( this.state.subscribeToken );
		}
	},
	render: function() {
		return (
			<span className="formated-price">{ currencyManager.toCurrentFormat(currencyManager.toCurrentCurrency(this.props.price, this.props.currency)) }</span>
		);
	}
});

var BarHorizontal = React.createClass({
	render: function() {
		var style = {
			width: this.props.value * 100 + "%"
		};
		return (
			<div className="bar-horizontal-wrap">
				<div className="bar-horizontal" style={ style }>
				</div>
			</div>
		);
	}
});

var DealsCityRow = React.createClass({
	render: function() {
		var relativePrice = this.props.flight.price / this.props.maxPrice;
		return (
			<a className="city" href={ this.props.flight.url }>
				<div className="city-name">{ this.props.flight.cityName } - { this.props.flight.airportCode }</div>
				<FormatedPrice price={ this.props.flight.price } currency={ this.props.flight.currency } />
				<BarHorizontal value={ relativePrice } />
			</a>
		);
	}
});

var DealsCountryRow = React.createClass({
	getInitialState: function() {
		return {
			openCountries: false
		};
	},
	toggleCountries: function () {
		this.setState({
			openCountries: !this.state.openCountries
		})
	},
	calculateMaxPrice: function () {
		var maxPrice = 0;
		this.props.country.cities.forEach(function (city) {
			if (city.price > maxPrice) {
				maxPrice = city.price;
			}
		});
		return maxPrice
	},
	render: function() {
		var self = this;
		var opened = false;
		var cityMaxPrice = this.calculateMaxPrice();
		var relativePrice = this.props.country.price / this.props.maxPrice;
		if (this.state.openCountries) {
			var cities = this.props.country.cities.map(function(flight) {
				return <DealsCityRow maxPrice={ cityMaxPrice } flight={ flight } />
			});
			opened = true
		}
		return (
			<div className={ React.addons.classSet( {country: true, opened: opened} ) }>
				<div className="country-header" onClick={ this.toggleCountries } >
					<div className="country-name">{ this.props.country.name }</div>
					<FormatedPrice price={ this.props.country.price } currency={ this.props.country.currency } />
					<BarHorizontal value={ relativePrice } />
					<i className={ React.addons.classSet( {'arrow-icon': true, 'icon-arrow_down': !opened, 'icon-arrow_up': opened} )} ></i>
				</div>

				<div className="cities">
					{ cities }
				</div>
			</div>
		);
	}
});

var DealsList = React.createClass({
	getInitialState: function() {
		return {
			data: [],
			limit: 20,
			dataState: "loading",
			roundtrip: false
		};
	},
	getData: function (roundtrip) {
		var self = this;
		self.setState({
			dataState: "loading"
		});
		this.props.service.getData(roundtrip, function(err, data) {
			var dataState = "";
			if (err) {
				dataState = "error"
			} else if (data.length > 0) {
				dataState = "done"
			} else if (data.length === 0) {
				dataState = "noResults"
			} else {
				dataState = "error"
			}

			self.setState({
				data: data,
				dataState: dataState,
				roundtrip: roundtrip
			});
		});
	},
	componentDidMount: function() {
		this.getData(false);
	},
	calculateMaxPrice: function () {
		var self = this;
		var maxPrice = 0;
		var i = 0;
		this.state.data.forEach(function (country) {
			i++;
			if (i > self.state.limit) return false;

			if (country.price > maxPrice) {
				maxPrice = country.price;
			}
		});
		return maxPrice
	},
	increaseLimit: function () {
		this.setState({ limit: this.state.limit + 20 });
	},
	setRoundtrip: function () {
		this.getData(true);
	},
	setOneway: function () {
		this.getData(false);
	},
	renderTabs: function() {
		return (
			<div className="tabs">
				<a className={ React.addons.classSet( {active: !this.state.roundtrip} ) } onClick={this.setOneway}>
					<Tran>One way</Tran>
				</a>
				<a className={ React.addons.classSet( {active: this.state.roundtrip} ) } onClick={this.setRoundtrip}>
					<Tran>Round trip</Tran>
				</a>
			</div>
		)
	},
	renderData: function () {
		var self = this;
		var i = 0;
		var message;

		var maxPrice = this.calculateMaxPrice();
		var rows = Object.keys(this.state.data).map(function(value, index) {
			i++;
			if (i > self.state.limit) return false;
			var country = self.state.data[value];
			return <DealsCountryRow country={ country } maxPrice={ maxPrice } />
		});
		var moreBtn = "";
		if (self.state.data.length >= self.state.limit) {
			moreBtn = (
				<div className="btn" onClick={ this.increaseLimit }>
					<Tran>Show more</Tran>
				</div>
			);
		}
		if (this.state.roundtrip) {
			message = (
				<Tran>Return flights are from 2 to 10 days after departure</Tran>
			)
		}

		return (
			<div>
				<div className="info-message">{ message }</div>
				<div className="dealsTable">
					{ rows }
				</div>
				<div className="footer">
					{ moreBtn }
				</div>
			</div>
		);
	},
	renderLoading: function () {
		return (
			<div className="message">
				<img src="/images/loaders/loader-search.gif" width="32" height="32" />
				<span> <Tran>Loading</Tran>... </span>
			</div>
		);
	},
	renderNoResults: function () {
		return (
			<div className="message">
				<span> <Tran>Not enough data for this route</Tran> </span>
			</div>
		);
	},
	renderError: function () {
		return (
			<div className="message">
				<span> <Tran>error</Tran> </span>
			</div>
		);
	},
	render: function() {
		var content;
		if (this.state.dataState == "loading") {
			content =  this.renderLoading();
		} else if (this.state.dataState == "done") {
			content =  this.renderData();
		} else if (this.state.dataState == "noResults") {
			content =  this.renderNoResults();
		} else {
			content =  this.renderError();
		}
		return (
			<div>
				{ this.renderTabs() }
				{ content }
			</div>
		)

	}
});

module.exports = DealsList;
